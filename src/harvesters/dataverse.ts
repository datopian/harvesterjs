import { env } from "../../config";
import {
  DataverseDatasetWithDetails,
} from "../schemas/dataverse";
import { CkanResource, PortalJsCloudDataset } from "../schemas/portaljs-cloud";
import { getDatasetDetails, listAllDatasets } from "../lib/dataverse";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { Harvester } from ".";

@Harvester
class DataverseHarvester extends BaseHarvester<DataverseDatasetWithDetails> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets(): Promise<DataverseDatasetWithDetails[]> {
    const baseItems = await listAllDatasets(this.config.source.url);

    const detailedItems = await Promise.all(
      baseItems.map(async (ds) => {
        const metadata = await getDatasetDetails(
          this.config.source.url,
          ds.global_id
        );
        return { ...ds, __details: metadata };
      })
    );

    return detailedItems;
  }

  mapSourceDatasetToTarget(
    ds: DataverseDatasetWithDetails
  ): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;
    const extras: PortalJsCloudDataset["extras"] = [];
    const resources: CkanResource[] = [];
    const version = ds.__details.latestVersion;
    const tags: { name: string }[] = ds.keywords?.map( (k)=>({name:k}) )

    // Add files as resources
    for (const file of version.files || []) {
      const df = file.dataFile;
      resources.push({
        name: df.filename,
        url: `${this.config.source.url}/api/access/datafile/${df.id}`,
        format: df.filename.split(".").pop()?.toUpperCase() || "FILE",
      });
    }

    // Extras
    extras.push({ key: "Source URL", value: ds.url });
    extras.push({ key: "Global ID", value: ds.global_id });
    extras.push({ key: "Last Harvested At", value: new Date().toISOString() });
    extras.push({ key: "Version", value: `${ds.majorVersion}.${ds.minorVersion}` });
    extras.push({ key: "Version State", value: ds.versionState });
    extras.push({
      key: "Version History URL",
      value: `${this.config.source.url}/dataset.xhtml?persistentId=${ds.global_id}`,
    });
    extras.push({ key: "Publisher", value: ds.__details.publisher });
    extras.push({ key: "DOI", value: ds.global_id });

    return {
      owner_org,
      name: `${owner_org}--${ds.global_id
        .replace(/[^a-z0-9-_]/gi, "-")
        .toLowerCase()}`,
      title: ds.name,
      notes: ds.description || "No description",
      author: ds.author,
      language: "EN", //dataverse does not natively support full multilingual dataset metadata
      resources,
      tags,
      extras,
    };
  }
}

export { DataverseHarvester };
