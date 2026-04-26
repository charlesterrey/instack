# ADR-001: Database Schema — 7 Tables with RLS

## Status
Accepted

## Context
instack needs a multi-tenant database to store generated apps, user data, data source connections, and audit trails. The system must enforce strict tenant isolation at the database level.

## Decision

### 7 Tables
1. **tenants** — Organizations with M365 SSO binding and plan tiers
2. **users** — Users scoped to tenants with role-based access (admin/creator/viewer)
3. **apps** — Generated apps with JSON schema stored as JSONB
4. **app_components** — Denormalized component instances for query performance
5. **data_sources** — Excel/SharePoint connections with sync state
6. **context_graph** — JSONB-based knowledge graph (replaces Neo4j for MVP simplicity)
7. **audit_log** — Immutable action log for governance

### Row Level Security (RLS)
All 7 tables have RLS enabled with a `tenant_isolation` policy using `current_setting('app.current_tenant_id')::UUID`. The API middleware sets this session variable before every query.

### Technology: Neon Serverless + Drizzle ORM
- Neon provides serverless PostgreSQL compatible with Cloudflare Workers via HTTP driver
- Drizzle ORM provides type-safe schema definition and query building
- Migrations managed by drizzle-kit

## Alternatives Considered
- **Supabase**: More features but less control over RLS policies and Workers compatibility
- **PlanetScale (MySQL)**: No native JSONB, weaker RLS story
- **Neo4j for context graph**: Over-engineered for MVP; JSONB edges in PostgreSQL suffice

## Consequences
- All queries must set the tenant session variable — enforced by middleware
- JSONB columns (schema_json, edges, metadata) trade query flexibility for schema flexibility
- GIN index on context_graph.edges enables efficient JSONB path queries
