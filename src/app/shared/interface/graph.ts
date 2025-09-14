export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  sublabel?: string;
  status?: string;
  hasWarning?: boolean;
  description?: string;
  iconUrl?: string;
  details?: { [key: string]: string };
  children?: NetworkNode[];
  parentId?: string;
  hoverCardHtml?: string; // Optional: custom HTML for hover card
}
