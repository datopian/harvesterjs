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
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch ODS datasets: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();

    if (!json || !json.length) {
      break;
    }
    
    const datasets = json.datasets;

    if (!datasets || datasets.length === 0) break;

    datasets.push(...datasets);
    offset += limit;
  }

  return datasets;
}
