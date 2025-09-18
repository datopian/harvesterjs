import { env } from "../../config";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { CkanResource, PortalJsCloudDataset } from "../schemas/portaljs-cloud";
import { Harvester } from ".";
import { type OdsCatalogDataset } from "../schemas/ods";
import { listAllDatasets } from "../lib/ods";
import { mapLanguage } from "../lib/utils";

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
    const extras: PortalJsCloudDataset["extras"] = [];
    const metadata = ds.dataset.metas?.default;
    const datasetId = ds.dataset.dataset_id;
    const baseUrl = this.config.source.url;
    const datasetTitle = metadata.title;
    const attachments = ds.dataset.attachments ?? [];

    extras.push({
      key: "Source URL",
      value: `${this.config.source.url}/explore/dataset/${datasetId}`,
    });

    extras.push({
      key: "Last Harvested At",
      value: new Date().toISOString(),
    });

    //create resource links for these formats
    ["csv", "json", "xlsx"].forEach((format) => {
      resources.push({
        name: `${datasetTitle}: ${format.toUpperCase()}`,
        url: `${baseUrl}/api/v2/catalog/datasets/${datasetId}/exports/${format}`,
        format: format.toUpperCase(),
      });
    });

    //create resource links for attatchemts if available
    attachments.forEach((att, index) => {
      resources.push({
        name: att.filename || `attachment-${index + 1}`,
        url: att.url,
        format: att.filename?.split(".").pop()?.toUpperCase() || "FILE",
      });
    });

    return {
      owner_org,
      name: `${owner_org}--${datasetId}`,
      title: datasetTitle,
      notes: metadata.description || "no description",
      author: metadata.publisher,
      language: mapLanguage(metadata.language),
      resources,
      tags: metadata.theme
        ?.flatMap((item) => item.split(/\s*,\s*/).map((str) => str.trim()))
        .map((t) => ({ name: t })),
      extras,
    };
  }
}

export { OpenDataSoftHarvester };
