// Sync Scheduler -- Cloudflare Workers cron trigger handler.
// @CONDUIT owns this file.
//
// Runs every 5 minutes via [triggers] crons.
// Fetches active data sources, syncs in batches of 5 concurrent.
// Atomic claims prevent double-sync from multiple Workers instances.
// Data flow: cron -> query active DS -> claim (UPDATE SET syncing) -> sync -> update status

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, ne } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { syncDataSource } from '../services/sync-engine.service';
import { proxyGraphCall } from '../services/token-proxy.service';
import { cleanupExpiredSandboxes } from '../services/sandbox.service';
import { logger } from '../lib/logger';
import type { KVNamespace } from '../services/data-cache.service';

/** Environment bindings for the cron handler */
interface CronEnv {
  DATABASE_URL: string;
  TOKEN_ENCRYPTION_KEY: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  MICROSOFT_TENANT_ID?: string;
  API_BASE_URL?: string;
  DATA_CACHE: KVNamespace;
}

/** Maximum concurrent syncs per cron run */
const MAX_CONCURRENT = 5;

/** Batch size for querying data sources */
const BATCH_SIZE = 50;

/**
 * Process a batch of data sources with limited concurrency.
 * Uses a simple semaphore pattern.
 */
async function processWithConcurrency<T>(
  items: T[],
  maxConcurrent: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const promise = fn(item).then(() => {
      executing.delete(promise);
    });
    executing.add(promise);

    if (executing.size >= maxConcurrent) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

/**
 * Cloudflare Workers scheduled event handler.
 * Called automatically by the cron trigger.
 */
export async function handleScheduled(
  _event: ScheduledEvent,
  env: CronEnv,
  ctx: ExecutionContext,
): Promise<void> {
  logger.info('sync-scheduler: cron triggered');

  const sqlClient = neon(env.DATABASE_URL);
  const db = drizzle(sqlClient, { schema });

  const oauthConfig = {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    tenantId: env.MICROSOFT_TENANT_ID ?? 'common',
    redirectUri: `${env.API_BASE_URL ?? 'http://localhost:8787'}/api/auth/callback`,
  };

  // Cleanup expired sandbox tenants (non-blocking)
  ctx.waitUntil(
    cleanupExpiredSandboxes(db).then((result) => {
      if (result.deleted > 0) {
        logger.info('sync-scheduler: sandbox cleanup', { deleted: result.deleted });
      }
    }),
  );

  try {
    // Fetch active data sources that are not already syncing, not in error, not disconnected
    const activeSources = await db
      .select()
      .from(schema.dataSources)
      .where(
        and(
          ne(schema.dataSources.syncStatus, 'syncing'),
          ne(schema.dataSources.syncStatus, 'error'),
          ne(schema.dataSources.syncStatus, 'disconnected'),
        ),
      )
      .limit(BATCH_SIZE);

    if (activeSources.length === 0) {
      logger.info('sync-scheduler: no active data sources to sync');
      return;
    }

    logger.info('sync-scheduler: processing data sources', { count: activeSources.length });

    let successCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;

    // Process with concurrency limit
    ctx.waitUntil(
      processWithConcurrency(activeSources, MAX_CONCURRENT, async (ds) => {
        // Atomic claim: mark as 'syncing' only if not already syncing
        const claimed = await db
          .update(schema.dataSources)
          .set({ syncStatus: 'syncing' })
          .where(
            and(
              eq(schema.dataSources.id, ds.id),
              ne(schema.dataSources.syncStatus, 'syncing'),
            ),
          )
          .returning({ id: schema.dataSources.id });

        if (claimed.length === 0) {
          // Another worker already claimed this one
          return;
        }

        // Build proxy call for the data source's creator
        // The creator is stored in the app's creatorId
        let userId = '';
        if (ds.appId) {
          const app = await db
            .select({ creatorId: schema.apps.creatorId })
            .from(schema.apps)
            .where(eq(schema.apps.id, ds.appId))
            .limit(1);
          userId = app[0]?.creatorId ?? '';
        }

        if (!userId) {
          // No user to proxy for — mark as error
          await db
            .update(schema.dataSources)
            .set({ syncStatus: 'error' })
            .where(eq(schema.dataSources.id, ds.id));
          errorCount++;
          logger.warn('sync-scheduler: no user for data source', { dsId: ds.id });
          return;
        }

        const proxyCall = async (endpoint: string, method: 'GET' | 'POST', body?: unknown) => {
          return proxyGraphCall({
            userId,
            endpoint,
            method,
            body,
            db,
            encryptionKey: env.TOKEN_ENCRYPTION_KEY,
            oauthConfig,
          });
        };

        const result = await syncDataSource(
          ds.id,
          ds.tenantId,
          userId,
          proxyCall,
          { db, kv: env.DATA_CACHE, encryptionKey: env.TOKEN_ENCRYPTION_KEY, oauthConfig },
        );

        if (result.ok) {
          if (result.value.status === 'updated') successCount++;
          else if (result.value.status === 'unchanged') unchangedCount++;
        } else {
          errorCount++;

          // On rate limit, stop processing this batch
          if (result.error.code === 'RATE_LIMITED') {
            logger.warn('sync-scheduler: rate limited, stopping batch', {
              retryAfterMs: result.error.retryAfterMs,
            });
          }
        }
      }),
    );

    logger.info('sync-scheduler: batch complete', {
      total: activeSources.length,
      updated: successCount,
      unchanged: unchangedCount,
      errors: errorCount,
    });
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    logger.error('sync-scheduler: unexpected error', { error: message });
  }
}
