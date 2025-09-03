import { config } from "dotenv";

config(); // loads .env

import { z } from "zod";

const EnvSchema = z.object({
  HARVESTER_NAME: z.string().min(1),
  SOURCE_API_URL: z.string().min(1),
  SOURCE_API_KEY: z.string().optional(),

  PORTALJS_CLOUD_API_URL: z.string().url().default("https://api.cloud.portaljs.com"),
  PORTALJS_CLOUD_API_KEY: z.string().min(1),
  PORTALJS_CLOUD_MAIN_ORG: z.string().min(1),

  CONCURRENCY: z.coerce.number().default(4),
  RATE_LIMIT_RPS: z.coerce.number().default(2),
  RETRY_MAX_ATTEMPTS: z.coerce.number().default(2),
  RETRY_BASE_MS: z.coerce.number().default(500),
  DRY_RUN: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof EnvSchema>;
export const env = EnvSchema.parse(process.env);
