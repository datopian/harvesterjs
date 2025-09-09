import * as Ckan from "./ckan";
import { env } from "../../config";
import { PortalJsCloudDataset } from "@/schemas/portaljs-cloud";
import { CkanRequestError } from "@portaljs/ckan-api-client-js";
import { serializeError } from "./utils";

const portalConfig = {
  ckanUrl: env.PORTALJS_CLOUD_API_URL,
  ckanApiToken: env.PORTALJS_CLOUD_API_KEY,
};

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
}: {
  dataset: PortalJsCloudDataset;
  dryRun?: boolean;
}) {
  const datasetName = dataset.name;
  if (!datasetName) {
    throw new Error("Dataset must have a 'name' field.");
  }

  if (dryRun) {
    console.log(`[dry run]: upsert ${JSON.stringify(dataset, null, 4)}`);
    return dataset;
  }

  try {
    return await createDataset(dataset);
  } catch (creationError) {
    if (
      creationError instanceof CkanRequestError &&
      creationError.message.includes("URL is already in use")
    ) {
      console.log(`CKAN update dataset: ${dataset.name}`);
      try {
        return await updateDataset(dataset);
      } catch (updateError) {
        console.error(
          `CKAN update dataset failed: ${dataset.name}`,
          serializeError(updateError)
        );
        throw updateError;
      }
    } else {
      console.error(
        `CKAN create dataset failed: ${dataset.name}`,
        serializeError(creationError)
      );
      throw creationError;
    }
  }
}
