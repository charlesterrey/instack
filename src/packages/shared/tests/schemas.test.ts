import { describe, it, expect } from 'vitest';
import {
  tenantSchema,
  createTenantSchema,
  tenantSettingsSchema,
} from '../src/schemas/tenant.schema';
import { userSchema, createUserSchema } from '../src/schemas/user.schema';
import {
  appSchema,
  createAppSchema,
  appSchemaJsonSchema,
  componentInstanceSchema,
} from '../src/schemas/app.schema';
import { dataSourceSchema, createDataSourceSchema } from '../src/schemas/data-source.schema';
import { graphNodeSchema, createGraphNodeSchema } from '../src/schemas/context-graph.schema';
import { auditEntrySchema, createAuditEntrySchema } from '../src/schemas/audit.schema';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';
const NOW = new Date().toISOString();

describe('Tenant schemas', () => {
  it('validates a valid tenant', () => {
    const result = tenantSchema.safeParse({
      id: VALID_UUID,
      name: 'Acme Corp',
      m365TenantId: 'tenant-123',
      plan: 'pro',
      settings: { maxApps: 50 },
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createTenantSchema.safeParse({
      name: '',
      m365TenantId: 'tenant-123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid plan', () => {
    const result = createTenantSchema.safeParse({
      name: 'Acme',
      m365TenantId: 'tenant-123',
      plan: 'ultra',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid settings', () => {
    const result = tenantSettingsSchema.safeParse({
      maxApps: 10,
      allowPublicApps: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative maxApps in settings', () => {
    const result = tenantSettingsSchema.safeParse({ maxApps: -1 });
    expect(result.success).toBe(false);
  });
});

describe('User schemas', () => {
  it('validates a valid user', () => {
    const result = userSchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      email: 'test@example.com',
      name: 'Jean Dupont',
      role: 'creator',
      m365UserId: 'user-abc',
      lastActiveAt: null,
      createdAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      tenantId: VALID_UUID,
      email: 'not-an-email',
      name: 'Test',
      m365UserId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({
      tenantId: VALID_UUID,
      email: 'test@example.com',
      name: 'Test',
      m365UserId: 'user-123',
      role: 'superadmin',
    });
    expect(result.success).toBe(false);
  });
});

describe('App schemas', () => {
  const validAppSchemaJson = {
    id: 'app-schema-1',
    name: 'Mon App',
    archetype: 'dashboard',
    layout: { type: 'single_page', columns: 2 },
    components: [
      {
        id: 'comp-1',
        type: 'kpi_card',
        props: { title: 'Revenue' },
        position: { row: 0, col: 0 },
      },
    ],
    dataBindings: [
      { id: 'bind-1', sourceId: 'src-1', field: 'revenue' },
    ],
  };

  it('validates a valid app schema JSON', () => {
    const result = appSchemaJsonSchema.safeParse(validAppSchemaJson);
    expect(result.success).toBe(true);
  });

  it('validates a valid full app', () => {
    const result = appSchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      creatorId: VALID_UUID,
      name: 'Dashboard Ventes',
      description: null,
      schemaJson: validAppSchemaJson,
      archetype: 'dashboard',
      status: 'active',
      visibility: 'team',
      expiresAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid archetype', () => {
    const result = createAppSchema.safeParse({
      tenantId: VALID_UUID,
      creatorId: VALID_UUID,
      name: 'Test App',
      archetype: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid component type', () => {
    const result = componentInstanceSchema.safeParse({
      id: 'comp-1',
      type: 'mega_widget',
      props: {},
      position: { row: 0, col: 0 },
    });
    expect(result.success).toBe(false);
  });

  it('validates all 8 archetypes', () => {
    const archetypes = [
      'crud_form', 'dashboard', 'tracker', 'report',
      'approval', 'checklist', 'gallery', 'multi_view',
    ];
    for (const archetype of archetypes) {
      const result = createAppSchema.safeParse({
        tenantId: VALID_UUID,
        creatorId: VALID_UUID,
        name: `Test ${archetype}`,
        archetype,
      });
      expect(result.success).toBe(true);
    }
  });

  it('validates all 12 component types', () => {
    const types = [
      'form_field', 'data_table', 'kpi_card', 'bar_chart',
      'pie_chart', 'line_chart', 'kanban_board', 'detail_view',
      'image_gallery', 'filter_bar', 'container', 'page_nav',
    ];
    for (const type of types) {
      const result = componentInstanceSchema.safeParse({
        id: `comp-${type}`,
        type,
        props: {},
        position: { row: 0, col: 0 },
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('DataSource schemas', () => {
  it('validates a valid data source', () => {
    const result = dataSourceSchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      appId: null,
      sourceType: 'excel_file',
      m365ResourceId: 'resource-123',
      syncConfig: { sheetName: 'Sheet1', range: 'A1:Z100' },
      lastSyncedAt: null,
      syncStatus: 'pending',
      createdAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid source type', () => {
    const result = createDataSourceSchema.safeParse({
      tenantId: VALID_UUID,
      sourceType: 'google_sheets',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all 3 source types', () => {
    for (const sourceType of ['excel_file', 'sharepoint_list', 'demo_data']) {
      const result = createDataSourceSchema.safeParse({
        tenantId: VALID_UUID,
        sourceType,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('ContextGraph schemas', () => {
  it('validates a valid graph node', () => {
    const result = graphNodeSchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      nodeType: 'app',
      nodeId: VALID_UUID,
      edges: [
        {
          targetId: VALID_UUID_2,
          relation: 'created',
          weight: 0.8,
          updatedAt: NOW,
        },
      ],
      metadata: { label: 'Test App' },
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid node type', () => {
    const result = createGraphNodeSchema.safeParse({
      tenantId: VALID_UUID,
      nodeType: 'server',
      nodeId: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it('rejects edge weight > 1', () => {
    const result = graphNodeSchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      nodeType: 'user',
      nodeId: VALID_UUID,
      edges: [
        { targetId: VALID_UUID_2, relation: 'uses', weight: 1.5, updatedAt: NOW },
      ],
      metadata: {},
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(result.success).toBe(false);
  });
});

describe('Audit schemas', () => {
  it('validates a valid audit entry', () => {
    const result = auditEntrySchema.safeParse({
      id: VALID_UUID,
      tenantId: VALID_UUID_2,
      userId: VALID_UUID,
      action: 'app.created',
      resourceType: 'app',
      resourceId: VALID_UUID,
      metadata: { appName: 'Dashboard Ventes' },
      ipAddress: '192.168.1.1',
      createdAt: NOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const result = createAuditEntrySchema.safeParse({
      tenantId: VALID_UUID,
      action: 'app.destroyed',
      resourceType: 'app',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all audit actions', () => {
    const actions = [
      'app.created', 'app.updated', 'app.deleted', 'app.archived',
      'app.shared', 'app.published', 'app.cloned',
      'user.login', 'user.logout', 'user.invited', 'user.role_changed',
      'data.synced', 'data.sync_failed', 'data.source_connected', 'data.source_disconnected',
      'tenant.settings_updated', 'tenant.plan_changed',
      'pipeline.started', 'pipeline.completed', 'pipeline.failed',
    ];
    for (const action of actions) {
      const result = createAuditEntrySchema.safeParse({
        tenantId: VALID_UUID,
        action,
        resourceType: 'test',
      });
      expect(result.success).toBe(true);
    }
  });
});
