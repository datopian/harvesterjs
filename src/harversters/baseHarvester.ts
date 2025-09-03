import { CkanPackage } from "@/schemas/ckanPackage"
import { PortalJsPackage } from "@/schemas/portalJsPackage"

export abstract class BaseHarvester {
  protected sourceUrl: string

  constructor(sourceUrl: string) {
    this.sourceUrl = sourceUrl
  }

  abstract iterSourcePackages(): AsyncGenerator<CkanPackage>

  abstract mapPackage(pkg: CkanPackage): PortalJsPackage

  async *run(): AsyncGenerator<PortalJsPackage> {
    for await (const sourcePkg of this.iterSourcePackages()) {
      yield this.mapPackage(sourcePkg)
    }
  }
}
