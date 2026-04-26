/** The 8 app archetypes the pipeline can generate */
export type AppArchetype =
  | 'crud_form'
  | 'dashboard'
  | 'tracker'
  | 'report'
  | 'approval'
  | 'checklist'
  | 'gallery'
  | 'multi_view';

/** App lifecycle status */
export type AppStatus = 'draft' | 'active' | 'archived' | 'expired';

/** App visibility scope */
export type AppVisibility = 'private' | 'team' | 'public';

/** The 12 atomic component types */
export type ComponentType =
  | 'form_field'
  | 'data_table'
  | 'kpi_card'
  | 'bar_chart'
  | 'pie_chart'
  | 'line_chart'
  | 'kanban_board'
  | 'detail_view'
  | 'image_gallery'
  | 'filter_bar'
  | 'container'
  | 'page_nav';

/** A single component instance within a generated app */
export interface ComponentInstance {
  readonly id: string;
  readonly type: ComponentType;
  readonly props: Record<string, unknown>;
  readonly position: {
    readonly row: number;
    readonly col: number;
    readonly span?: number;
  };
  readonly dataBinding?: string;
}

/** Layout configuration for an app */
export interface LayoutConfig {
  readonly type: 'single_page' | 'multi_page' | 'sidebar';
  readonly columns?: number;
  readonly gap?: string;
}

/** Data binding configuration */
export interface DataBinding {
  readonly id: string;
  readonly sourceId: string;
  readonly field: string;
  readonly transform?: string;
}

/** The complete JSON schema of a generated app */
export interface AppSchema {
  readonly id: string;
  readonly name: string;
  readonly archetype: AppArchetype;
  readonly layout: LayoutConfig;
  readonly components: readonly ComponentInstance[];
  readonly dataBindings: readonly DataBinding[];
}

/** An app record as stored in the database */
export interface App {
  readonly id: string;
  readonly tenantId: string;
  readonly creatorId: string;
  readonly name: string;
  readonly description: string | null;
  readonly schemaJson: AppSchema;
  readonly archetype: AppArchetype;
  readonly status: AppStatus;
  readonly visibility: AppVisibility;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
