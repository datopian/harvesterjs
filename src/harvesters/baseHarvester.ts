import { CkanPackage } from "@/schemas/ckanPackage"
import { PortalJsPackage } from "@/schemas/portalJsPackage"

export abstract class BaseHarvester<TSource, TTarget> {
  protected sourceUrl: string;
  protected sinceISO: string;

  constructor(sourceUrl: string, sinceISO: string ) {
    this.sourceUrl = sourceUrl;
    this.sinceISO  = sinceISO ;
  }

   abstract iterSourcePackages(): AsyncGenerator<TSource>

  abstract mapPackage(pkg: TSource): TTarget

  async *run(): AsyncGenerator<TTarget> {
    for await (const sourcePkg of this.iterSourcePackages()) {
      yield this.mapPackage(sourcePkg)
    }
  }
}
