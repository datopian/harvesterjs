import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { env } from "../config";
import { CkanDataset } from "../types/ckan.dataset";

interface PackageSearchResult {
  count: number;
  results: CkanDataset[];
}

export async function* iterSourcePackages(pageSize = 25) {
  let start = 0;

  const fqParts: string[] = [];

  if (env.CKAN_ORG_ID)
    fqParts.push(`organization:${JSON.stringify(env.CKAN_ORG_ID)}`);

  if (env.SINCE_ISO) fqParts.push(`metadata_modified:[${env.SINCE_ISO} TO *]`);

  const fqString = fqParts.join(" ");

  while (true) {
    const params = new URLSearchParams({
      rows: String(pageSize),
      start: String(start),
    });
    if (fqString) params.set("fq", fqString);

    const action = `package_search?${params.toString()}`;

    const pkgSearch = await CkanRequest.get<CkanResponse<PackageSearchResult>>(
      action,
      {
        ckanUrl: env.CKAN_BASE_URL,
      }
    );

    if (pkgSearch.error) {
      throw new Error(
        `CKAN response unsuccessful: ${JSON.stringify(pkgSearch.error)}`
      );
    }

    const results = pkgSearch.result.results;
    if (!results.length) break;

    for (const ds of results) yield ds;

    start += results.length;
    if (start >= pkgSearch.result.count) break;
  }
}
