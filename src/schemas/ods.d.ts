export interface ODSDataset {
  id: string;
  name: string;
  assetType: string;
  description?: string;
  owner?: {
    displayName: string;
  };
  blobFilename?: string;
  blobId?: string;
  category?: string;
  metadata: {
    attachments?: {
      filename: string;
      assetId?: string;
      blobId?: string;
      name: string;
    }[];
  };
  viewType?: string;
  tags?: string[]
}