/** Node types in the context graph */
export type NodeType = 'user' | 'team' | 'app' | 'data_source' | 'file' | 'column';

/** Relation types between nodes */
export type RelationType =
  | 'created'
  | 'uses'
  | 'owns'
  | 'shares'
  | 'derived_from'
  | 'belongs_to'
  | 'connected_to'
  | 'viewed'
  | 'edited';

/** An edge in the context graph */
export interface GraphEdge {
  readonly targetId: string;
  readonly relation: RelationType;
  readonly weight: number;
  readonly updatedAt: Date;
}

/** A node in the context graph */
export interface GraphNode {
  readonly id: string;
  readonly tenantId: string;
  readonly nodeType: NodeType;
  readonly nodeId: string;
  readonly edges: readonly GraphEdge[];
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
