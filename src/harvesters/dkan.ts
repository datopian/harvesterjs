import { env } from "../../config";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { Harvester } from ".";

interface DkanSearchResponse {
  total: string; 
  results: Record<string, DkanDataset>;
}

interface DkanDataset {
  "@type": string;
  identifier: string;
  title: string;
  description?: string;
  keyword?: string[];
  language?: string;
  distribution?: DkanResource[];
  [key: string]: any;
}

interface DkanResource {
  "@type": string;
  identifier?: string;
  title: string;
  format?: string;
  mediaType?: string;
  downloadURL?: string;
  accessURL?: string;
  [key: string]: any;
}

@Harvester
class DkanHarvester extends BaseHarvester<DkanDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets(): Promise<DkanDataset[]> {
    const datasets: DkanDataset[] = [];
    const baseUrl = `${this.config.source.url}/api/1/search`;
    const pageSize = 100;
    let page = 1;
    let total = 0;

    do {
      const url = `${baseUrl}?page-size=${pageSize}&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch DKAN datasets: ${res.status} ${res.statusText}`);
      }

      const json:DkanSearchResponse = (await res.json());

      const pageResults = Object.values(json.results || {});
      
      datasets.push(...pageResults);

      total = parseInt(json.total);
      page++;
    } while (datasets.length < total);

    return datasets;
  }


  mapSourceDatasetToTarget(pkg: DkanDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;

    return {
      owner_org,
      name: `${owner_org}--${pkg.identifier}`,
      title: pkg.title,
      notes: pkg.description || "no description",
      resources: (pkg.distribution || []).map((r: DkanResource) => ({
        name: r.title,
        url: r.downloadURL || r.accessURL || "",
        format: r.format || r.mediaType || "unknown",
        ...(r.identifier ? { id: r.identifier } : {}),
      })),
      language:  "EN",
    };
  }
}

export { DkanHarvester };
