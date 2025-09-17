import { OdsCatalogDataset } from "@/schemas/ods";

export async function listAllDatasets({
  odsUrl,
  odsAppToken,
  limit = 100,
}: {
  odsUrl: string;
  odsAppToken?: string;
  limit?: number;
}) {
  let datasets: OdsCatalogDataset[] = [];
  let offset = 0;

  while (true) {
    const url = `${odsUrl}/api/v2/catalog/datasets?limit=${limit}&offset=${offset}`;
    const headers: Record<string, string> = {};

    if (odsAppToken) {
      headers["Authorization"] = `Bearer ${odsAppToken}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch ODS datasets: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();

    if (!json || json.datasets.length === 0) break;

    datasets.push(...json.datasets)

    offset += limit;
  }

  return datasets;
}
