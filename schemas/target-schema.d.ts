// Auto-generated from CKAN schema
export interface TargetSchema {
  title?: string;
  name: string;
  notes?: string;
  tag_string?: string;
  license_id?: string;
  owner_org?: string;
  version?: string;
  author?: string;
  author_email?: string;
  maintainer?: string;
  maintainer_email?: string;
  language: "EN" | "FR" | "ES" | "DE" | "IT";
  coverage?: string;
  rights?: string;
  conforms_to?: string;
  has_version?: string;
  is_version_of?: string;
  contact_point?: string;
  resources?: CkanResource[];
}

export interface CkanResource {
  url?: string;
  name?: string;
  description?: string;
  format?: string;
}
