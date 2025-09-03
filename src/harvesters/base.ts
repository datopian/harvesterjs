export abstract class BaseHarvester<TSource, TTarget> {
  protected sourceUrl: string;

  constructor(sourceUrl: string) {
    this.sourceUrl = sourceUrl;
  }

  abstract iterSourcePackages(): AsyncGenerator<TSource>;

  abstract mapPackage(pkg: TSource): TTarget;

  async *run(): AsyncGenerator<TTarget> {
    for await (const sourcePkg of this.iterSourcePackages()) {
      yield this.mapPackage(sourcePkg);
    }
  }
}
