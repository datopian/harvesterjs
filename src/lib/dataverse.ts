import {
  DataverseDataset,
  DataverseSearchResponse,
  DataverseDatasetWithDetails,
  DataverseDatasetMetadata,
} from "@/schemas/dataverse";

export async function listAllDatasets(dataverseUrl: string): Promise<DataverseDataset[]> {
  const perPage = 100;
  let start = 0;
  let allItems: DataverseDataset[] = [];

  while (true) {
    console.log(`Fetching datasets from page ${start / perPage + 1}`);
    
    const query = `subject:${encodeURIComponent("Law")}`

    const res = await fetch(
      `${dataverseUrl}/api/search?q=${query}&type=dataset&per_page=${perPage}&start=${start}&subtree=demo`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch datasets: ${res.status}`);
    }

    const json: DataverseSearchResponse = await res.json();
    const items = json.data.items;

    if (!items.length) break;

    allItems.push(...items);
    start += perPage;
  }

  return allItems;
}

export async function getDatasetDetails(
  dataverseUrl: string,
  persistentId: string
): Promise<DataverseDatasetMetadata> {
  const url = `${dataverseUrl}/api/datasets/:persistentId?persistentId=${encodeURIComponent(
    persistentId
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch dataset metadata: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}