import { detectFormat, getAllArcgisDatasets } from "../lib/arcgis";
import { Harvester } from ".";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { CkanResource, PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { env } from "../../config";
import { ArcgisDataset } from "@/schemas/arcgis";

@Harvester
class ArcgisHarvester extends BaseHarvester<ArcgisDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets() {
    return await getAllArcgisDatasets({
      arcgisUrl: this.config.source.url,
      limit: 100,
    });
  }

  mapSourceDatasetToTarget(ds: ArcgisDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;

    const idPart = (ds.name ?? ds.id)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const resources: CkanResource[] = [];

    if (ds.url) {
      resources.push({
        name: ds.title || ds.id,
        url: ds.url,
        format: detectFormat(ds.url, ds.type),
      });
    }

    try {
      const raw = ds.raw;
      const props = raw?.properties || {};

      const extras =
        props.links ||
        props.distribution ||
        props.resources ||
        props.assets ||
        [];
      if (Array.isArray(extras)) {
        for (const e of extras) {
          const rUrl = e.href || e.url || e.link;
          if (rUrl && !resources.find((r) => r.url === rUrl)) {
            resources.push({
              name: e.title || e.name || ds.title,
              url: rUrl,
              format: detectFormat(rUrl),
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    const target: PortalJsCloudDataset = {
      owner_org,
      name: `${owner_org}--${idPart}`,
      title: ds.title || ds.id,
      notes: ds.description || "no description",
      resources,
      language: "EN",
      tags: ds?.tags?.map((t) => ({ name: t })),
    };

    return target;
  }
}

export { ArcgisHarvester };
