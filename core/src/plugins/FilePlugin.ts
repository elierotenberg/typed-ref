import { promises } from "fs";

import { safeLoad } from "js-yaml";

import { ResolverPlugin } from "../Ref";

export interface IFileRefParams {
  readonly path: string;
  readonly format: "json" | "yaml";
}

export const FilePlugin: ResolverPlugin<IFileRefParams> = {
  unref: async ({ path, format }) => {
    const fileContents = await promises.readFile(path, { encoding: "utf-8" });

    if (format === "json") {
      return JSON.parse(fileContents);
    }
    return safeLoad(fileContents);
  },
  parse: (params) => {
    if (typeof params !== "object" || params === null) {
      throw TypeError();
    }
    const { path, format } = params as Record<string, unknown>;
    if (typeof path !== "string") {
      throw TypeError();
    }
    if (format !== "json" && format !== "yaml") {
      throw TypeError();
    }
    return { path, format };
  },
};
