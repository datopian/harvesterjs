import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { buildOrFq } from "./utils";

type CkanActionConfig = {
  ckanUrl: string;
  ckanApiToken?: string;
};

type CkanProtectedActionConfig = CkanActionConfig & {
  ckanApiToken: string;
};

export async function getDatasetsByOrganization({
  ckanUrl,
  ckanApiToken,
  organizationId,
}: CkanActionConfig & { organizationId: string }) {
  let allResults: PortalJsCloudDataset[] = [];
  let start = 0;
  const rows = 25;

  while (true) {
    const response = await searchDatasets({
      ckanUrl,
      ckanApiToken,
      start: start,
      rows: rows,
      organization: organizationId,
    });

    if (!response.success) {
      throw new Error("CKAN request failed");
    }

    allResults = allResults.concat(response.result.results);

    if (allResults.length >= response.result.count) break;

    start += rows;
  }

  return allResults;
}

export async function searchDatasets<DatasetSchemaT = any>({
  ckanUrl,
  ckanApiToken,
  rows = 25,
  start = 0,
  organization,
}: // TODO: implement the rest of the accepted parameters
CkanActionConfig & {
  rows?: number;
  start?: number;
  organization?: string;
}) {
  const fq = [];

  if (organization) {
    fq.push(buildOrFq("organization", [organization]));
  }

  const searchParams = new URLSearchParams({
    rows: String(rows),
    start: String(start),
    fq: fq.join("+"),
  });

  return await CkanRequest.get<
    CkanResponse<{ count: number; results: DatasetSchemaT[] }>
  >(`package_search?${searchParams.toString()}`, {
    ckanUrl,
    apiKey: ckanApiToken,
  });
}

export async function getAllDatasets<DatasetSchemaT = any>({
  ckanUrl,
  ckanApiToken,
}: CkanActionConfig) {
  const datasets: DatasetSchemaT[] = [];
  const limit = 10;
  let page = 0;
  while (true) {
    const offset = page * limit;
    const response = await searchDatasets({
      ckanUrl,
      ckanApiToken,
      start: offset,
      rows: limit,
    });

    const newDatasets = response.result.results;

    if (!!newDatasets?.length) {
      datasets.push(...newDatasets);
    } else {
      break;
    }

    page++;
  }

  return datasets;
}

export async function createDataset<DatasetSchemaT = any>({
  ckanUrl,
  ckanApiToken,
  dataset,
}: CkanProtectedActionConfig & { dataset: DatasetSchemaT }) {
  return await CkanRequest.post("package_create", {
    ckanUrl: ckanUrl,
    apiKey: ckanApiToken,
    json: dataset,
  });
}

export async function updateDataset<DatasetSchemaT = any>({
  ckanUrl,
  ckanApiToken,
  dataset,
}: CkanProtectedActionConfig & { dataset: DatasetSchemaT }) {
  return await CkanRequest.post("package_update", {
    ckanUrl: ckanUrl,
    apiKey: ckanApiToken,
    json: dataset,
  });
}
