import { env } from "../config";
import { CkanDataset } from "../interfaces/ckan.dataset"

const CKAN_API = `${env.CKAN_BASE_URL.replace(/\/$/, "")}/api/3/action`;

function authHeaders():any {
  return env.CKAN_API_KEY ? { "Authorization": env.CKAN_API_KEY } : {};
}

export async function *iterCkanDatasets() {
  // Use package_search with pagination; optional org filter; optional modified-since filter
  const pageSize = 100; // CKAN default max often 1000, but keep modest
  let start = 0;

  const fqParts: string[] = [];
  if (env.CKAN_ORG_ID) fqParts.push(`organization:${JSON.stringify(env.CKAN_ORG_ID)}`);
  if (env.SINCE_ISO) fqParts.push(`metadata_modified:[${env.SINCE_ISO} TO *]`);
  const fq = fqParts.length ? fqParts.join(" ") : undefined;

  while (true) {
    const url = new URL(`${CKAN_API}/package_search`);
    url.searchParams.set("rows", String(pageSize));
    url.searchParams.set("start", String(start));
    if (fq) url.searchParams.set("fq", fq);

    const res = await fetch(url, { headers: { "Content-Type": "application/json", ...authHeaders() } });
    if (!res.ok) throw new Error(`CKAN search failed: ${res.status} ${res.statusText}`);
    const body = await res.json();
    if (!body.success) throw new Error("CKAN response unsuccessful");

    const results: CkanDataset[] = body.result.results;
    if (!results.length) break;

    for (const ds of results) yield ds;

    start += results.length;
    const total = body.result.count as number;
    if (start >= total) break;
  }
}