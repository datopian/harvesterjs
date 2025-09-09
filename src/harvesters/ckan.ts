import { env } from "../../config";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { CkanPackage } from "@/schemas/ckanPackage";
import { Harvester } from ".";
import { getAllDatasets } from "../lib/ckan";

@Harvester
class CkanHarvester<SourceDatasetT extends CkanPackage = CkanPackage> extends BaseHarvester<SourceDatasetT> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets() {
    return await getAllDatasets({
      ckanUrl: this.config.source.url,
      ckanApiToken: this.config.source.apiKey,
    });
  }

  mapSourceDatasetToTarget(pkg: SourceDatasetT): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG; // TODO: get this automatically based on the main org of the PortalJS Cloud token
    return {
      owner_org,
      name: `${owner_org}--${pkg.name}`,
      title: pkg.title,
      notes: pkg.notes || "no description",
      resources: (pkg.resources || []).map((r: any) => ({
        name: r.name,
        url: r.url,
        format: r.format
      })),

      language: pkg.language || "EN",
    };
  }
}

export { CkanHarvester };
