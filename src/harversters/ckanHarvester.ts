import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { env } from "../../config";
import { BaseHarvester } from "./baseHarvester";

import { PortalJsPackage } from "@/schemas/portalJsPackage";
import { CkanPackage } from "@/schemas/ckanPackage";

interface PackageSearchResult {
  count: number;
  results: CkanPackage[];
}

export class CkanHarvester extends BaseHarvester {
  constructor() {
    super(env.SOURCE_CKAN_URL);
  }

  async *iterSourcePackages(pageSize = 25): AsyncGenerator<CkanPackage> {
    let start = 0;

    const fqParts: string[] = [];

    if (env.SOURCE_CKAN_ORG_ID)
      fqParts.push(`organization:${JSON.stringify(env.SOURCE_CKAN_ORG_ID)}`);

    if (env.SINCE_ISO)
      fqParts.push(`metadata_modified:[${env.SINCE_ISO} TO *]`);

    const fqString = fqParts.join(" ");

    while (true) {
      const params = new URLSearchParams({
        rows: String(pageSize),
        start: String(start),
      });
      if (fqString) params.set("fq", fqString);

      const action = `package_search?${params.toString()}`;

      const pkgSearch = await CkanRequest.get<
        CkanResponse<PackageSearchResult>
      >(action, {
        ckanUrl: env.SOURCE_CKAN_URL,
        apiKey: env.SOURCE_CKAN_API_KEY || undefined,
      });

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

  mapPackage(pkg: CkanPackage): PortalJsPackage {
    const owner_org = env.PORTALJS_ORG_ID;
    return {
      owner_org,
      name: `${owner_org}--${pkg.name}`,
      title: pkg.title,
      notes: pkg.notes || "no description",
      resources: (pkg.resources || []).map((r: any) => ({
        name: r.name,
        url: r.url,
        format: r.format,
        ...(r.id ? { id: r.id } : {}),
      })),

      language: pkg.language || "EN",
    };
  }
}
