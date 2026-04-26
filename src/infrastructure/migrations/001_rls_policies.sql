-- 001_rls_policies.sql
-- Enable Row Level Security on all 7 tables and create tenant isolation policies
-- Pattern: each query sets app.current_tenant_id as a session variable

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
-- Tenants: can only see their own tenant row
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant_id', true)::UUID);

-- Users: isolated by tenant_id
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- Apps: isolated by tenant_id
CREATE POLICY tenant_isolation ON apps
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- App components: isolated by tenant_id
CREATE POLICY tenant_isolation ON app_components
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- Data sources: isolated by tenant_id
CREATE POLICY tenant_isolation ON data_sources
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- Context graph: isolated by tenant_id
CREATE POLICY tenant_isolation ON context_graph
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- Audit log: isolated by tenant_id
CREATE POLICY tenant_isolation ON audit_log
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- GIN index on context_graph edges for JSONB queries
CREATE INDEX IF NOT EXISTS context_graph_edges_gin_idx ON context_graph USING GIN (edges);
