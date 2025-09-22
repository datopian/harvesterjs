export interface ArcgisDataset {
  id: string;
  name: string;
  title?: string;
  description?: string;
  keywords?: string[];
  type?: string;
  modified?: string | number;
  created?: string | number;
  url?: string;
  raw?: any;
  tags?: string[];
}
