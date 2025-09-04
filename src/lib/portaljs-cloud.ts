import * as Ckan from "./ckan";
import { env } from "../../config";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";

const portalConfig = {
  ckanUrl: env.PORTALJS_CLOUD_API_URL,
  ckanApiToken: env.PORTALJS_CLOUD_API_KEY,
};

// TODO: this is not right, because in PortalJS Cloud
// we have to get datasets that belong to a specific
// org. Also, this endpoint retrieves data based on a
// limit
export async function getDatasetList() {
  return (
    await Ckan.getDatasetsByOrganization({
      ...portalConfig,
      organizationId: env.PORTALJS_CLOUD_MAIN_ORG,
    })
  ).map((ds) => ds.name);
}

export async function createDataset(dataset: PortalJsCloudDataset) {
  return await Ckan.createDataset<PortalJsCloudDataset>({
    ...portalConfig,
    dataset,
  });
}

export async function updateDataset(dataset: PortalJsCloudDataset) {
  return await Ckan.updateDataset<PortalJsCloudDataset>({
    ...portalConfig,
    dataset,
  });
}

export async function upsertDataset({
  dataset,
  dryRun = false,
  preexistingDatasets,
}: {
  dataset: PortalJsCloudDataset;
  dryRun?: boolean;
  preexistingDatasets: string[];
}) {
  const datasetName = dataset.name;
  if (!datasetName) {
    throw new Error("Dataset must have a 'name' field.");
  }

  const exists = preexistingDatasets.find((d) => d === datasetName)
    ? true
    : false;

  if (dryRun) {
    console.log(
      `[dry run]: ${exists ? "updating" : "adding"} ${JSON.stringify(
        dataset,
        null,
        4
      )}`
    );

    return dataset;
  }

  const action = exists ? updateDataset : createDataset;
  try {
    return await action(dataset);
  } catch (e) {
    throw new Error(`CKAN ${exists ? "update" : "create"} failed: ${e}`);
  }
}
