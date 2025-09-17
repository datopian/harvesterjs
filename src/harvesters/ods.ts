import { env } from "../../config";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { CkanResource, PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { Harvester } from ".";
import { type OdsCatalogDataset } from "@/schemas/ods";
import { listAllDatasets } from "@/lib/ods";


@Harvester
class OpenDataSoftHarvester extends BaseHarvester<OdsCatalogDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets() {
    return await listAllDatasets({
      odsUrl: this.config.source.url,
      odsAppToken: this.config.source.apiKey,
    });
  }

  mapSourceDatasetToTarget(ds: OdsCatalogDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;
    const resources: CkanResource[] = [];

    const extras = [];

    extras.push({
      key: "Source URL",
      value: `${this.config.source.url}/explore/dataset/${ds.dataset.dataset_id}`,
    });

    extras.push({
      key: "Last Harvested At",
      value: new Date().toISOString(),
    });

    return {
      owner_org,
      name: `${owner_org}--${ds.dataset.dataset_id}`,
      title: ds.dataset.metas.title,
      notes: ds.dataset.metas.description || "no description",
      author: ds.dataset.metas.publisher,
      language: ds.dataset.metas.language?.toUpperCase() || "EN",
      resources,
      tags: ds.dataset.metas.theme?.map((t) => ({ name: t })),
      extras,
    };
  }
}

export { OpenDataSoftHarvester };
