import { BaseHarvester } from "./base";
import fs from "fs";
import path from "path";

const folder = path.resolve(__dirname);
export const HARVESTERS = new Map();

interface BaseConstructor {
  new (...args: any[]): BaseHarvester;
}

export function Harvester<C extends BaseConstructor>(cls: C) {
  HARVESTERS.set(cls.name, cls);
}

// Register all harvesters
fs.readdirSync(folder).forEach((file) => {
  if (file.endsWith(".ts") && !["base.ts", "index.ts"].includes(file)) {
    require(path.join(folder, file));
  }
});
