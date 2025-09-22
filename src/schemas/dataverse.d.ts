export interface DataverseSearchResponse {
  status: string;
  data: {
    items: DataverseDataset[];
  };
}

export interface DataverseDataset {
  name: string;
  type: "dataset";
  url: string;
  global_id: string;
  published_at: string;
  description: string;
  fileCount: number;
  author: string;
  identifier_of_dataverse: string;
  keywords:string[];
  majorVersion:number;
  minorVersion:number;
  versionState:string;
}

export interface DataverseDatasetWithDetails extends DataverseDataset {
  __details: DataverseDatasetMetadata;
}

export interface DataverseDatasetMetadata {
  publisher:string;
  latestVersion: {
    metadataBlocks: Record<string, any>;
    files?: DataverseFile[];
    license?: {
      name: string;
      uri: string;
    };
    versionState: string;
  };
}

export interface DataverseFile {
  label: string;
  dataFile: {
    id: number;
    contentType: string;
    filename: string;
    filesize: number;
    storageIdentifier: string;
  };
}

export interface DataverseMetadataField {
  typeName: string;
  value: any;
  multiple?: boolean;
  typeClass?: string;
}