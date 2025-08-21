import type { CkanDataset } from "../types/ckan.dataset";
import type { PortalJSDataset } from "../types/portaljs.dataset";

export function mapCkanToPortalJS(ds: CkanDataset, owner_org: string): PortalJSDataset {
  return {
    owner_org,
    name: `${owner_org}--${ds.name}`,
    title: ds.title,
    category: ds.group || "harvested",
    frequency: "daily",
    language: "en",
    notes: ds.notes || "no description",
    version: "v1",
    version_notes: "v notes",
    source: "harvester",
    resources: (ds.resources || []).map((r) => ({
      name: r.name,
      url: r.url,
      format: r.format,
      mimetype: r.mimetype,
    })),
    
  };
}
