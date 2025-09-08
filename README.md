# PortalJS Harvesters

This repo provides a **harvester runner** to pull datasets from external sources and upsert them into **PortalJS Cloud** .

---

## Configuration

Configuration is done via the following environment variables, which can be set in a `.env` file (see `.env.example`):
- `HARVESTER_NAME`: name of the harvester type
  - Built-in: **CkanHarvester** pulls from CKAN via `package_search` and maps into PortalJS Cloud.
- `SOURCE_API_URL`: source api url
- `PORTALJS_CLOUD_API_URL`: PortalJS Cloud api url
- `PORTALJS_CLOUD_API_KEY`: PortalJS Cloud api key for insert/update
- `PORTALJS_CLOUD_MAIN_ORG`: Main organization name


## Custom Harvesters

In order to create custom harvesters for data sources that are not natively supported, you can:


1. Create `src/harvesters/custom.ts`.
2. Extend `BaseHarvester` and decorate with `@Harvester`.
3. Implement:
   * `getSourceDatasets()` → fetch and return all datasets from your source.
   * `mapSourceDatasetToTarget()` → convert source dataset into the target schema.
4. Set `HARVESTER_NAME=CustomHarvester` in `.env` and run.

The base class handles **concurrency, rate limit, retries, upsert**

### Example

```js
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { Harvester } from ".";
import { BaseHarvester, BaseHarvesterConfig } from "./base";
import { env } from "../../config";

type CustomDataset = {
  name: string;
  title: string;
  description: string;
 //...
};

@Harvester
class CustomHarvester extends BaseHarvester<CustomDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  async getSourceDatasets() {
    //implement logic to fetch datasets from source
  }

  mapSourceDatasetToTarget(pkg: CustomDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;
    return {
      //map source dataset to PortalJS Cloud
    };
  }
}

export { CustomHarvester };

```

## Notes
* Target schema: see `src/schemas/portaljs-cloud.d.ts`.
* Class name must exactly match `HARVESTER_NAME`.
* Use `DRY_RUN=true` for safe testing.

