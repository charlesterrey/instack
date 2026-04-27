/** Types of data sources connectable to an app */
export type DataSourceType = 'excel_file' | 'sharepoint_list' | 'demo_data';

/** Sync lifecycle status */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error' | 'disconnected';

/** Configuration for how a data source syncs */
export interface SyncConfig {
  readonly sheetName?: string;
  readonly range?: string;
  readonly refreshInterval?: number;
  readonly columns?: readonly string[];
  readonly lastContentHash?: string;
  readonly lastModifiedAt?: string;
}

/** A data source connection record */
export interface DataSource {
  readonly id: string;
  readonly tenantId: string;
  readonly appId: string | null;
  readonly sourceType: DataSourceType;
  readonly m365ResourceId: string | null;
  readonly syncConfig: SyncConfig;
  readonly lastSyncedAt: Date | null;
  readonly syncStatus: SyncStatus;
  readonly createdAt: Date;
  readonly name?: string;
  readonly creatorId?: string;
}
