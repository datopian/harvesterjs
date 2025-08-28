// generate-types.ts
import fs from "fs";
import { env } from "./config";
import { capitalize } from "./src/utils";



interface SchemaField {
  field_name: string;
  choices?: Array<{ value: string; label: string }>;
  validators?: string;
}

async function generateTypes(type: string, schemaUrl: string) {
  const res = await fetch(schemaUrl);
  const data = await res.json();
  const { dataset_fields, resource_fields } = data.result;

  const datasetProps = dataset_fields.map((f: SchemaField) => {
    let tsType = "string";

    if (f.choices) {
      tsType = f.choices.map((c) => `"${c.value}"`).join(" | ");
    }

    const isRequired =
      f.validators &&
      (f.validators.includes("not_empty") ||
        f.validators.includes("scheming_required"));

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

  fs.writeFileSync(`schemas/${type}-schema.d.ts`, content);
  console.log(`✅ Types generated in schemas/${type}-schema.d.ts`);
}

generateTypes(
  "target",
  env.PORTALJS_CKAN_URL +
    "/api/3/action/scheming_dataset_schema_show?type=dataset"
);
