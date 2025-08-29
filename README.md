# PortalJS CKAN Harvester 

A template harvester that pulls datasets from a **CKAN source** and upserts them into a **PortalJS CKAN target**.

**fetch → map → upsert**

---

## Quick Start

```bash
npm install
cp .env.example .env   # or edit the existing .env
npm start              # run the harvester
```

---

## Environment Variables (.env)

Use these exact names. Example values are placeholders:

```env
# CKAN source
SOURCE_CKAN_URL=<https://source-ckan.example.org>
SOURCE_CKAN_API_KEY=<source-api-key-or-empty>
SOURCE_CKAN_ORG_ID=<org-slug-or-empty>

# PortalJS Cloud target
PORTALJS_CKAN_URL=<http://localhost:5000>
PORTALJS_CKAN_API_KEY=<target-api-key>
PORTALJS_ORG_ID=<target-org-id>

# Harvest behavior
CONCURRENCY=4
RATE_LIMIT_RPS=2
RETRY_MAX_ATTEMPTS=2
RETRY_BASE_MS=500

# Incremental window
SINCE_ISO=2025-02-01T00:00:00Z
STATE_FILE=.harvest_state.json

```

* **`SOURCE_CKAN_URL`** – source CKAN base URL

* **`SOURCE_CKAN_API_KEY`** – source API key (optional)

* **`SOURCE_CKAN_ORG_ID`** – restrict harvest to one org (optional, empty = harvest all)

* **`PORTALJS_CKAN_URL`** – target CKAN base URL

* **`PORTALJS_CKAN_API_KEY`** – target API key (**required**)

* **`PORTALJS_ORG_ID`** – target org where datasets will be created (must exist first)

* **`CONCURRENCY`** – how many datasets to process in parallel (optional, default 4) 

* **`RATE_LIMIT_RPS`** – max HTTP requests per second (optional, default 2) 

* **`RETRY_MAX_ATTEMPTS`** – number of retry attempts on failure (optional, default 2) 

* **`RETRY_BASE_MS`** – base delay (ms) for exponential backoff (optional, default 500) 

* **`SINCE_ISO`** – harvest only datasets modified after this date (overrides state file) (optional)

* **`STATE_FILE`** – JSON file used to track last run. Stores `lastRunISO`. Lets the harvester run incrementally instead of fetching everything every time.

---

## How It Works

1. **Discover** datasets from source CKAN (`package_search`), filtered by org and/or date.
2. **Map** each dataset from source schema → target schema.
3. **Upsert** into target CKAN (update if exists, create if not).
4. **Persist state** in `STATE_FILE` for the next incremental run.

---

## Project Structure



* **`index.ts`** – main entry. Loads env + state, chooses full vs incremental run, loops datasets, maps, upserts, logs results, updates state.
* **`config.ts`** – loads `.env` with `dotenv` and validates using **Zod**.
* **`gen-schema.ts`** – generates `schemas/target-schema.d.ts` from target CKAN scheming API.
* **`.github/workflows/run-index.yml`** – GitHub Action to run on schedule or manual trigger.

* **`schemas/`**

  * **`source-schema.d.ts`** – interface for source datasets.
  * **`target-schema.d.ts`** – auto-generated interface for target datasets.

* **`src/`**

  * **`source.ts`** – source CKAN client.

    * `iterSourcePackages()` async generator over `package_search`.
    * Supports org filter and incremental filtering (`metadata_modified >= …`).

  * **`target.ts`** – target CKAN helpers.

    * Preloads dataset list with `package_list`.
    * `upsertPortalDataset()` creates or updates dataset with API key.

  * **`map.ts`** – mapping logic.

    * Sets `owner_org` to `PORTALJS_ORG_ID`.
    * Prefixes dataset `name` with `<owner_org>--` (unique, PortalJS-friendly).
    * Maps `title`, `notes`, resources, and ensures defaults (language = EN, description fallback, etc.).

  * **`state.ts`** – reads/writes the `STATE_FILE` JSON.

  * **`utils.ts`** – small helpers (`withRetry()`, `sleep()`, etc.).

---

## Running

1. Edit `.env`.
2. Run `npm start`.
3. Logs will show:

   * “Full harvest mode” or “Incremental mode since <ISO>”
   * Final summary: `total=… upserts=… failures=…`

---

## Extending

* **Mapping** – extend `src/map.ts` to add fields (tags, extras, licenses, etc.).
* **Filters** – extend `iterSourcePackages()` to filter by groups, tags, etc.
* **Retries** – tweak retry/backoff logic in `utils.ts`.
