import { env } from "../config";
import type { PortalJSDataset } from "../interfaces/portaljs.dataset.js";

const BASE = env.PORTALJS_BASE_URL.replace(/\/$/, "");

function headers() {
  console.log(env.PORTALJS_API_TOKEN)
  return {
    "Content-Type": "application/json",
    "Authorization": `${env.PORTALJS_API_TOKEN}`,
  };
}

export async function upsertPortalDataset(payload: PortalJSDataset) {
  const datasetName = payload.name;
  if (!datasetName) {
    throw new Error("Dataset payload must include a 'name' field.");
  }

  // 1. Check if dataset exists
  const exists = await datasetExists(datasetName);

  // 2. Choose endpoint
  const endpoint = exists
    ? `${BASE}/api/3/action/package_update`
    : `${BASE}/api/3/action/package_create`;

  // 3. Send request
  const res = await fetch(endpoint, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `CKAN ${exists ? "update" : "create"} failed: ${res.status} ${res.statusText} — ${text}`
    );
  }

  return res.json();
}

async function datasetExists(name: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/3/action/package_show?id=${encodeURIComponent(name)}`);

  return res.ok;
}