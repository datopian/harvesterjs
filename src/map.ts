import type { CkanDataset } from "../interfaces/ckan.dataset";
import type { PortalJSDataset } from "../interfaces/portaljs.dataset";

export function mapCkanToPortalJS(
  ds: CkanDataset,
  opts: { orgId: string; ckanBaseUrl: string }
): PortalJSDataset {
  return {
    owner_org: opts.orgId,
    name: ds.name,
    title: ds.title,
    category: ds.group||"harvested",
    frequency: "daily",
    language: "en",
    notes: ds.notes || "no description",
    version: "v1",
    version_notes: "v notes",
    source:"harvester",
    resources: (ds.resources || []).map((r) => ({
      name: r.name,
      url: r.url,
      format: r.format,
      mimetype: r.mimetype,
    })),
  };
}
