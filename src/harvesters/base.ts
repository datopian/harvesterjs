import { withRetry } from "../lib/utils";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import Bottleneck from "bottleneck";
import { getDatasetList, upsertDataset } from "../lib/portaljs-cloud";

export type BaseHarvesterConfig = {
  source: {
    url: string;
    apiKey: string;
    rps: number;
    concurrency: number;
  };
  dryRun?: boolean;
};

export abstract class BaseHarvester<SourceDatasetT extends {[k: string]: string} = any> {
  protected config: BaseHarvesterConfig;

  constructor(config: BaseHarvesterConfig) {
    this.config = config;
  }

  abstract getSourceDatasets(): Promise<SourceDatasetT[]>;
  abstract mapSourceDatasetToTarget(
    dataset: SourceDatasetT,
  ): PortalJsCloudDataset;

  async getTargetPreexistingDatasets(): Promise<string[]> {
    return await getDatasetList();
  }
  async upsertIntoTarget({
    dataset,
    preexistingDatasets,
  }: {
    dataset: PortalJsCloudDataset;
    preexistingDatasets: string[];
  }) {
    return await upsertDataset({
      dataset,
      preexistingDatasets,
      dryRun: this.config.dryRun,
    });
  }

  async run() {
    const startTime = Date.now();
    const jobs: Promise<void>[] = [];
    const limiter = new Bottleneck({
      minTime: Math.ceil(1000 / Math.max(1, this.config.source.rps)),
      maxConcurrent: Math.max(1, this.config.source.concurrency),
    });
    let total = 0;
    let upserts = 0;
    let failures = 0;

    const preexistingDatasets = await this.getTargetPreexistingDatasets();

    const sourceDatasets = await this.getSourceDatasets();
    for (const sourcePkg of sourceDatasets) {
      total++;

      const job = async () => {
        try {
          const targetPackage = this.mapSourceDatasetToTarget(sourcePkg);
          await withRetry(
            () =>
              this.upsertIntoTarget({
                dataset: targetPackage,
                preexistingDatasets,
              }),
            `upsert ${targetPackage.name}`,
          );
          upserts++;
        } catch (err: any) {
          failures++;
          console.error(`✖ Failed ${sourcePkg}:`, err?.message || err);
        }
      };
      jobs.push(limiter.schedule(job));
    }
    await Promise.all(jobs);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\n✅ Done. total=${total}, upserts=${upserts}, failures=${failures} (${duration}s)`,
    );
  }
}
