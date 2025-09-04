// generate-types.ts
import fs from "fs";
import { env } from "./config";
import { capitalize } from "./src/lib/utils";

interface SchemaField {
  field_name: string;
  choices?: Array<{ value: string; label: string }>;
  validators?: string | string[];
}

async function generateTypes(type: string, schemaUrl: string) {
  const res = await fetch(schemaUrl);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch schema from ${schemaUrl}: ${res.status} ${
        res.statusText
      } ${text.slice(0, 300)}`
    );
  }
  const data = await res.json();
  const { dataset_fields, resource_fields } = data.result;

  const datasetProps = dataset_fields.map((f: SchemaField) => {
    let tsType = "string";

    if (f.choices) {
      tsType = f.choices.map((c) => JSON.stringify(String(c.value))).join(" | ");
    }

    const validators = Array.isArray(f.validators) ? f.validators : (f.validators ? [f.validators] : []);
    const isRequired = validators.some(v => v.includes("not_empty") || v.includes("scheming_required"));

    return `  ${f.field_name}${isRequired ? "" : "?"}: ${tsType};`;
  });

  const resourceProps = resource_fields.map((f: SchemaField) => {
    return `  ${f.field_name}?: string;`;
  });

  const content = `// Auto-generated from CKAN schema
export interface ${capitalize(type)}Schema {
${datasetProps.join("\n")}
  resources?: CkanResource[];
}

export interface CkanResource {
${resourceProps.join("\n")}
}
`;

  fs.mkdirSync("schemas", { recursive: true });
  fs.writeFileSync(`schemas/${type}-schema.d.ts`, content);
  console.log(`✅ Types generated in schemas/${type}-schema.d.ts`);
}

generateTypes(
  "target",
  env.PORTALJS_CKAN_URL +
    "/api/3/action/scheming_dataset_schema_show?type=dataset"
);
