import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { env } from "../config";
import type { PortalJsPackage } from "./schemas/portalJsPackage";

const targetCkanUrl = env.PORTALJS_CKAN_URL.replace(/\/$/, "");

let allDatasets = getAllDatasets();

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `${env.PORTALJS_CKAN_API_KEY}`,
  };
}

export async function upsertPortalDataset(
  payload: PortalJsPackage,
  dryRun = false,
) {
  const datasetName = payload.name;
  if (!datasetName) {
    throw new Error("Dataset payload must include a 'name' field.");
  }

  const exists = (await allDatasets).find((d) => d === datasetName)
    ? true
    : false;

  if (dryRun) {
    console.log(`[dry run]: ${exists ? "updating" : "adding"} ${JSON.stringify(payload, null, 4)}`);

    return payload;
  }

  const endpoint = exists
    ? `${targetCkanUrl}/api/3/action/package_update`
    : `${targetCkanUrl}/api/3/action/package_create`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `CKAN ${exists ? "update" : "create"} failed: ${res.status} ${
        res.statusText
      } — ${text}`,
    );
  }

  return res.json();
}

async function getAllDatasets(): Promise<String[]> {
  const datasets = await CkanRequest.get<CkanResponse<String[]>>(
    "package_list",
    {
      ckanUrl: targetCkanUrl,
    },
  );
  return datasets.result;
}
