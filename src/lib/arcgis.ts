import { ArcgisDataset } from "@/schemas/arcgis";

export async function getAllArcgisDatasets({
  arcgisUrl,
  limit = 100,
}: {
  arcgisUrl: string;
  limit?: number;
}): Promise<ArcgisDataset[]> {
  const datasets: ArcgisDataset[] = [];
  let nextUrl: string = `${arcgisUrl.replace(/\/$/, "")}/api/search/v1/collections/dataset/items?limit=${limit}`;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to fetch ArcGIS datasets: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    const json = await res.json();
    const features = json.features || [];
    for (const f of features) {
      const props = f.properties || {};
      datasets.push({
        id: String(f.id || props.id || props.guid || props.name || props.title),
        name: props.name,
        title: props.title || props.name || props.label,
        description: props.description || props.snippet || props.summary,
        keywords: props.keywords || props.tags || [],
        type: props.type || props.resourceType || props.itemType,
        modified: props.modified,
        created: props.created,
        url:
          props.url || props.landingPage || props.serviceUrl || props.homepage,
        raw: f,
        tags: props.tags,
      });
    }

    const nextLink = json.links?.find((l: any) => l.rel === "next");
    nextUrl = nextLink?.href || null;
  }

  return datasets;
}

export function detectFormat(url?: string, type?: string) {
  if (type) {
    // prefer the explicit type if available
    return String(type);
  }
  if (!url) return "unknown";
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (
      ext &&
      ["csv", "json", "geojson", "zip", "shp", "kml", "kmz", "xml"].includes(
        ext,
      )
    ) {
      return ext.toUpperCase();
    }
  } catch (e) {
    // noop
  }
  return "unknown";
}
