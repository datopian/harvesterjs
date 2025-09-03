import { config } from "dotenv";

config(); // loads .env

import { z } from "zod";

const EnvSchema = z.object({
  SOURCE_CKAN_URL: z.string().url(),
  SOURCE_CKAN_API_KEY: z.string().optional(),

  PORTALJS_CKAN_URL: z.string().url(),
  PORTALJS_CKAN_API_KEY: z.string().min(1),
  PORTALJS_ORG_ID: z.string().min(1),

  CONCURRENCY: z.coerce.number().default(4),
  RATE_LIMIT_RPS: z.coerce.number().default(2),
  RETRY_MAX_ATTEMPTS: z.coerce.number().default(2),
  RETRY_BASE_MS: z.coerce.number().default(500),
  DRY_RUN: z.coerce.boolean().default(false),

});

export type Env = z.infer<typeof EnvSchema>;
export const env = EnvSchema.parse(process.env);
