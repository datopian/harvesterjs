import Bottleneck from "bottleneck";
import { env } from "./config";
import { iterCkanDatasets } from "./src/ckan";
import { mapCkanToPortalJS } from "./src/map";
import { upsertPortalDataset } from "./src/cloud";
import { readState, writeState } from "./src/state";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let attempt = 0;
  const max = env.RETRY_MAX_ATTEMPTS;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= max) throw err;
      const backoff = env.RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn(`[retry] ${label} failed (attempt ${attempt}/${max}). Backing off ${backoff}ms`);
      await sleep(backoff);
    }
  }
}

async function main() {
  // Incremental: prefer ENV SINCE_ISO; else use saved state
  const state = await readState();
  const since = env.SINCE_ISO || state.lastRunISO;
  if (since) console.log(`Incremental mode since ${since}`);
  else console.log(`Full harvest mode`);

  // Build limiter: RPS and concurrency
  const limiter = new Bottleneck({
    minTime: Math.ceil(1000 / Math.max(1, env.RATE_LIMIT_RPS)),
    maxConcurrent: Math.max(1, env.CONCURRENCY),
  });

  let total = 0, upserts = 0, skipped = 0, failures = 0;

  for await (const ds of iterCkanDatasets()) {
    total++;

    const job = async () => {
      const payload = mapCkanToPortalJS(ds, { orgId: env.PORTALJS_ORG_ID, ckanBaseUrl: env.CKAN_BASE_URL });
      if (env.DRY_RUN) {
        console.log(`[dry-run] would upsert dataset: ${payload.name}`);
        return;
      }
      await withRetry(() => upsertPortalDataset(payload), `upsert ${ds.name}`);
      upserts++;
      if (total % 50 === 0) console.log(`Progress: ${total} processed, ${upserts} upserts, ${skipped} skipped, ${failures} failures`);
    };

    await limiter.schedule(job).catch(err => {
      failures++;
      console.error(`✖ failed ${ds.name}:`, err?.message || err);
    });
  }

  await writeState({ lastRunISO: new Date().toISOString() });
  console.log(`\n✅ Done. total=${total} upserts=${upserts} skipped=${skipped} failures=${failures}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});