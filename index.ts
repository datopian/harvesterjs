import { env } from "./config";
import { HARVESTERS } from "./src/harvesters";
import { BaseHarvester, BaseHarvesterConfig } from "./src/harvesters/base";

async function main() {
  const HarvesterCls = HARVESTERS.get(env.HARVESTER_NAME);

  if (!HarvesterCls) {
    throw new Error("Harvester not found");
  }

  const harvester = new HarvesterCls({
    source: {
      url: env.SOURCE_API_URL,
      apiKey: env.SOURCE_API_KEY,
      rps: env.RATE_LIMIT_RPS,
      concurrency: env.CONCURRENCY,
    },
    dryRun: env.DRY_RUN
  } as BaseHarvesterConfig) as BaseHarvester;

  await harvester.run();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
