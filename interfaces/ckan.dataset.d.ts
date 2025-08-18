export type CkanDataset = {
  id: string;
  name: string;
  title?: string;
  notes?: string;
  metadata_modified?: string;
  organization?: { id?: string; name?: string };
  resources?: Array<{ id: string; name?: string; url?: string; format?: string; mimetype?: string }>;
  group:string;
  [k: string]: unknown;
};