export async function listAllDatasets({
  socrataUrl,
  socrataAppToken,
  limit = 100,
}: {
  socrataUrl: string;
  socrataAppToken?: string;
  limit?: number;
}) {
  const datasets: any[] = [];
  let page = 1;
  const headers: Record<string, string> = {};

  if (socrataAppToken) {
    headers["X-App-Token"] = socrataAppToken;
  }

  while (true) {
    console.log(`Fetching datasets from page ${page}`);
    const urlSearchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit)
    });

    const url = `${socrataUrl}/api/views?${urlSearchParams.toString()}`;

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch Socrata datasets: ${res.status} ${res.statusText}`,
      );
    }

    const json = await res.json();

    if (!json || !json.length) {
      break;
    }

    datasets.push(...json);
    page++;
  }

  return datasets;
}
