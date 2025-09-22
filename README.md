# PortalJS Harvesters

<div align="center">
  
**Extendable harvester framework built with TypeScript. Harvest data from a variety of sources into your PortalJS portal.**
  
With out-of-the-box support to 🌀 [PortalJS Cloud](https://portaljs.com)

</div>

---

## Built-in Harvesters

The following sources are supported out-of-the-box:

- [CKAN](./src/harvesters/ckan.ts)
- [DKAN](./src/harvesters/dkan.ts)
- [Socrata Open Data](./src/harvesters/socrata.ts)
- [OpenDataSoft (ODS)](./src/harvesters/ods.ts)
- 🚧 ArcGIS Hub/Portal
- [Dataverse Repository](./src/harvesters/dataverse.ts)

## Running Harvesters

You can run this tool in any platform that supports Node, such as GitHub actions.

1. Install dependecies with `npm install`
2. Setup the environment variables according to the [configuration](#configuration) section
3. Run `npm run start`

See the [GitHub Action example](https://github.com/datopian/harvesterjs/blob/main/.github/workflows/run-harvester.yml).

## Configuration

The following environment variables can be used to configure the tool:

- `HARVESTER_NAME` - E.g., "CkanHarvester". Literally the name of the harvester class as defined in [./src/harvesters](./src/harvesters).
- `SOURCE_API_URL` - E.g., "http://ckan.com". The source URL from which you want to harvest datasets.
- `SOURCE_API_KEY` - (Optional) Used for authenticated requests when private data should be harvested.
- `PORTALJS_CLOUD_API_URL` - (Optional) Defaults to https://api.cloud.portaljs.com/.
- `PORTALJS_CLOUD_MAIN_ORG` - The name of your main organization in PortalJS Cloud.
- `PORTALJS_CLOUD_API_KEY` - You can create PortalJS Cloud API keys in your PortalJS Cloud account profile.
- `DRY_RUN` - (Optional). Whether data should be ingested or just logged. Either `true` or undefined.

You can set these environment variables either with a `.env` file or in the runner's environment.

## Development

For development and testing harvesters locally:

1. Clone this repo
2. Install dependencies with `npm i`
3. Duplicate [`.env.example`](./.env.example) and rename it to `.env`
4. Customize the `.env` as you'd like (see [configuration](#configuration)) 
5. Start harvesting with `npm run start`

> [!TIP]
> Dry runs are supported via the `DRY_RUN=true` environment variable

## Extending

This tool is built to be extendable by design. 

It can be customized to harvest data from any source by extending either a preexisting [built-in harvesters](./src/harvesters) or the [base harvester](./src/harvesters/base.ts).

One common use case would be, for example, if you want to havest data from a CKAN instance that uses a custom metadata schema. 

In this case, you could simply create a new harvester extending the [CKAN harvester](./src/harvesters/ckan.ts) and override the Source to Target mapping, as shown in the example below.

### Creating a Custom Harvester

1. Create a new file in the `src/harvesters/` directory.
2. Extend `BaseHarvester` (or any other pre-built harvester class) and decorate it with `@Harvester`.
3. Implement overrides:
   * `getSourceDatasets()` → Fetch and return all datasets from your source.
   * `mapSourceDatasetToTarget()` → Convert source dataset schema into the PortalJS Cloud dataset schema.
4. Set `HARVESTER_NAME=YourCustomHarvester` in `.env` and run. The name of your custom harvester is simply the name of the class that defines it.

The base harvester handles concurrency, rate limit, retries, upsert, but note that all these can be fleely overriden and customized.

#### Example: Harvester for a CKAN instance with a custom dataset metadata schema

```ts
import { CkanPackage } from "@/schemas/ckanPackage";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { Harvester } from ".";
import { BaseHarvesterConfig } from "./base";
import { CkanHarvester } from "./ckan";
import { env } from "../../config";

type CustomCkanPortalDataset = CkanPackage & {
    data_owner_email: string;
};

@Harvester
class CustomCkanPortalHarvester extends CkanHarvester<CustomCkanPortalDataset> {
  constructor(args: BaseHarvesterConfig) {
    super(args);
  }

  mapSourceDatasetToTarget(pkg: CustomCkanPortalDataset): PortalJsCloudDataset {
    const owner_org = env.PORTALJS_CLOUD_MAIN_ORG;
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
      contact_point: pkg.data_owner_email // <== Custom field to PortalJS Cloud mapping
    };
  }
}

export { CustomCkanPortalHarvester };
```
