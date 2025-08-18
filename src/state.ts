import { env } from "../config";
import { readFile, writeFile } from "node:fs/promises";

export type HarvestState = { lastRunISO?: string };

export async function readState(): Promise<HarvestState> {
  try {
    const txt = await readFile(env.STATE_FILE, "utf8");
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

export async function writeState(state: HarvestState) {
  await writeFile(env.STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}