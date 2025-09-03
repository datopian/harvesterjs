import Bottleneck from "bottleneck";
import { env } from "./config";
import { CkanHarvester } from "./src/harversters/ckanHarvester";
import { upsertPortalDataset } from "./src/target";
import { readState, writeState } from "./src/state";
import { withRetry } from "./src/utils";

async function main() {
  const startTime = Date.now();
  const state = await readState();
  const since = env.SINCE_ISO || state.lastRunISO;
  console.log(since ? `Incremental mode since ${since}` : `Full harvest mode`);

  const limiter = new Bottleneck({
    minTime: Math.ceil(1000 / Math.max(1, env.RATE_LIMIT_RPS)),
    maxConcurrent: Math.max(1, env.CONCURRENCY),
  });

  let total = 0;
  let upserts = 0;
  let failures = 0;
  const jobs: Promise<void>[] = [];

  const harvester = new CkanHarvester();

  for await (const pkg of harvester.run()) {
    total++;

    const job = async () => {
      try {
        await withRetry(() => upsertPortalDataset(pkg), `upsert ${pkg.name}`);
        upserts++;
      } catch (err: any) {
        failures++;
        console.error(`✖ Failed ${pkg.name}:`, err?.message || err);
      }
    };

    jobs.push(limiter.schedule(job));
  }

  await Promise.all(jobs);

  await writeState({ lastRunISO: new Date().toISOString() });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(
    `\n✅ Done. total=${total}, upserts=${upserts}, failures=${failures} (${duration}s)`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
