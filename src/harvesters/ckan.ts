import CkanRequest, { CkanResponse } from "@portaljs/ckan-api-client-js";
import { env } from "../../config";
import { BaseHarvester } from "./base";
import { PortalJsPackage } from "@/schemas/portalJsPackage";
import { CkanPackage } from "@/schemas/ckanPackage";

interface PackageSearchResult {
  count: number;
  results: CkanPackage[];
}

export class CkanHarvester extends BaseHarvester<CkanPackage, PortalJsPackage> {
  constructor(url:string) {
    super(url);
  }

  async *iterSourcePackages(pageSize = 25): AsyncGenerator<CkanPackage> {
    let start = 0;

    while (true) {
      const params = new URLSearchParams({
        rows: String(pageSize),
        start: String(start),
      });

      const action = `package_search?${params.toString()}`;

      const pkgSearch = await CkanRequest.get<
        CkanResponse<PackageSearchResult>
      >(action, {
        ckanUrl: this.sourceUrl,
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
    const owner_org = env.PORTALJS_ORG_ID; // TODO: get this automatically based on the main org of the PortalJS Cloud token
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
