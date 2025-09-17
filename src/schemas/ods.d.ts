export interface OdsCatalogResponse {
  total_count: number;
  datasets: OdsCatalogDataset[];
  links?: OdsLink[];
}

export interface OdsCatalogDataset {
  links: OdsLink[];
  dataset: {
    dataset_id: string;
    dataset_uid: string;
    has_records: boolean;
    visibility: string;
    features?: string[];
    attachments?: any[];
    alternative_exports?: any[];
    data_visible: boolean;
    fields: OdsField[];
    metas: {
      default: OdsMetadata;
    };
  };
}

export interface OdsMetadata {
  title: string;
  description: string;
  theme?: string[];
  keyword?: string[] | null;
  license?: string;
  license_url?: string;
  language?: string;
  metadata_languages?: string[];
  modified?: string;
  data_processed?: string;
  metadata_processed?: string;
  geographic_reference?: string[];
  territory?: string[];
  publisher?: string;
  references?: string;
  update_frequency?: string | null;
}

export interface OdsField {
  name: string;
  type: string;
  label?: string;
  description?: string | null;
  annotations?: {
    facet?: boolean;
    [key: string]: any;
  };
}

export interface OdsLink {
  rel: string;
  href: string;
}
