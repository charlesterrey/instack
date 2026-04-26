import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  inet,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Table 1: Tenants
// ============================================================================
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    m365TenantId: text('m365_tenant_id').unique().notNull(),
    plan: text('plan', { enum: ['free', 'pro', 'enterprise'] })
      .notNull()
      .default('free'),
    settings: jsonb('settings').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// ============================================================================
// Table 2: Users
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: text('role', { enum: ['admin', 'creator', 'viewer'] })
      .notNull()
      .default('creator'),
    m365UserId: text('m365_user_id').notNull(),
    encryptedAccessToken: text('encrypted_access_token'),
    encryptedRefreshToken: text('encrypted_refresh_token'),
    tokenIv: text('token_iv'),
    tokenTag: text('token_tag'),
    refreshTokenIv: text('refresh_token_iv'),
    refreshTokenTag: text('refresh_token_tag'),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantEmailIdx: uniqueIndex('users_tenant_email_idx').on(table.tenantId, table.email),
    tenantRoleIdx: index('users_tenant_role_idx').on(table.tenantId, table.role),
  }),
);

// ============================================================================
// Table 3: Apps
// ============================================================================
export const apps = pgTable(
  'apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
    schemaJson: jsonb('schema_json').notNull(),
    archetype: text('archetype', {
      enum: [
        'crud_form',
        'dashboard',
        'tracker',
        'report',
        'approval',
        'checklist',
        'gallery',
        'multi_view',
      ],
    }).notNull(),
    status: text('status', { enum: ['draft', 'active', 'archived', 'expired'] })
      .notNull()
      .default('draft'),
    visibility: text('visibility', { enum: ['private', 'team', 'public'] })
      .notNull()
      .default('private'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index('apps_tenant_status_idx').on(table.tenantId, table.status),
    tenantCreatorIdx: index('apps_tenant_creator_idx').on(table.tenantId, table.creatorId),
    tenantArchetypeIdx: index('apps_tenant_archetype_idx').on(table.tenantId, table.archetype),
  }),
);

// ============================================================================
// Table 4: App Components
// ============================================================================
export const appComponents = pgTable(
  'app_components',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appId: uuid('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    componentType: text('component_type', {
      enum: [
        'form_field',
        'data_table',
        'kpi_card',
        'bar_chart',
        'pie_chart',
        'line_chart',
        'kanban_board',
        'detail_view',
        'image_gallery',
        'filter_bar',
        'container',
        'page_nav',
      ],
    }).notNull(),
    configJson: jsonb('config_json').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// ============================================================================
// Table 5: Data Sources
// ============================================================================
export const dataSources = pgTable(
  'data_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    appId: uuid('app_id').references(() => apps.id, { onDelete: 'set null' }),
    sourceType: text('source_type', {
      enum: ['excel_file', 'sharepoint_list', 'demo_data'],
    }).notNull(),
    m365ResourceId: text('m365_resource_id'),
    syncConfig: jsonb('sync_config').notNull().default({}),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    syncStatus: text('sync_status', {
      enum: ['pending', 'syncing', 'synced', 'error'],
    })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantAppIdx: index('data_sources_tenant_app_idx').on(table.tenantId, table.appId),
    tenantSyncIdx: index('data_sources_tenant_sync_idx').on(table.tenantId, table.syncStatus),
  }),
);

// ============================================================================
// Table 6: Context Graph
// ============================================================================
export const contextGraph = pgTable(
  'context_graph',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    nodeType: text('node_type', {
      enum: ['user', 'team', 'app', 'data_source', 'file', 'column'],
    }).notNull(),
    nodeId: uuid('node_id').notNull(),
    edges: jsonb('edges').notNull().default([]),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantNodeIdx: uniqueIndex('context_graph_tenant_node_idx').on(
      table.tenantId,
      table.nodeType,
      table.nodeId,
    ),
  }),
);

// ============================================================================
// Table 7: Audit Log
// ============================================================================
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: uuid('resource_id'),
    metadata: jsonb('metadata').notNull().default({}),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantCreatedIdx: index('audit_log_tenant_created_idx').on(table.tenantId, table.createdAt),
    tenantActionIdx: index('audit_log_tenant_action_idx').on(table.tenantId, table.action),
  }),
);
