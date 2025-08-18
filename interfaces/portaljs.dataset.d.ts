export type PortalJSDataset = {
  name: string;
  title?: string;
  category: string;
  frequency: string;
  language: string;
  notes: string;
  owner_org: string;
  version: string;
  version_notes: string;
  source: string;
  resources?: Array<{
    name?: string;
    url?: string;
    format?: string;
    mimetype?: string;
  }>;
};
