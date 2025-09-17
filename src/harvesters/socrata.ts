import { env } from "../../config";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { CkanResource, PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { Harvester } from ".";
import { listAllDatasets } from "../lib/socrata";
import { type SocrataDataset } from "@/schemas/socrata";

@Harvester
class SocrataHarvester extends BaseHarvester<SocrataDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets() {
    return await listAllDatasets({
      socrataUrl: this.config.source.url,
      socrataAppToken: this.config.source.apiKey,
    });
  }

  mapSourceDatasetToTarget(ds: SocrataDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;

    const resources: CkanResource[] = [];

    // Attachments
    for (let att of ds.metadata.attachments ?? []) {
      let url = "";
      if (att.assetId) {
        url = `${this.config.source.url}/api/views/${ds.id}/files/${att.assetId}?filename=${att.filename}`;
      } else {
        url = `${this.config.source.url}/api/assets/${att.blobId}?download=true`;
      }
      resources.push({
        name: att.name ?? att.filename,
        url,
      });
    }

    // Tabular resource
    if (ds.viewType === "tabular") {
      resources.push({
        name: ds.name,
        url: `${this.config.source.url}/api/views/${ds.id}/rows.csv`,
      });
    }

    // Extras
    const extras = [];
    extras.push({
      key: "Source URL",
      value: `${this.config.source.url}/d/${ds.id}`,
    });
    extras.push({
      key: "Last Harvested At",
      value: new Date().toISOString(),
    });
    if (ds.category) {
      extras.push({ key: "Category", value: ds.category });
    }

    return {
      owner_org,
      name: `${owner_org}--${ds.id}`,
      title: ds.name,
      notes: ds.description || "no description",
      author: ds.owner?.displayName,
      language: "EN", // Socrata datasets don’t usually have a language field
      resources,
      tags: ds.tags?.map((t) => ({ name: t })),
      extras,
    };
  }
}

export { SocrataHarvester };
