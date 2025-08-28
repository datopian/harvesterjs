import type { SourceSchema } from "../schemas/source-schema";
import type { TargetSchema } from "../schemas/target-schema";

export function mapCkanToPortalJS(ds: SourceSchema, owner_org: string): TargetSchema {
  return {
    owner_org,
    name: `${owner_org}--${ds.name}`,
    title: ds.title,
    notes: ds.notes || "no description",
    resources: (ds.resources || []).map((r:any) => ({
      name: r.name,
      url: r.url,
      format: r.format,
      id:""
    })),

    language:ds.language || "EN"
    
  };
}
