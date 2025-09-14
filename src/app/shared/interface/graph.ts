export interface NetworkNode {
  id: string;
  label: string;
  type: 'client' | 'server' | 'database';
  sublabel?: string;
  description?: string;
  status?: string;
  hasWarning?: boolean;
  details?: { [key: string]: string };
  // For compound nodes (two elements)
  children?: NetworkNode[];
  parentId?: string; // for flattened children
  iconUrl?: string; // URL for image-based node icon
}

export interface NetworkLink {
  source: string;
  target: string;
}

export interface NetworkConfig {
  nodeRadius?: number;
  linkDistance?: number;
  chargeStrength?: number;
  collisionRadius?: number;
  colors?: {
    client?: string;
    server?: string;
    database?: string;
    warning?: string;
  };
  icons?: {
    client?: string;
    server?: string;
    database?: string;
  };
}
