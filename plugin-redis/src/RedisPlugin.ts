import { promisify } from "util";

import { RedisClient } from "redis";
import { ResolverPlugin } from "typed-ref-core";
import { safeLoad } from "js-yaml";

export interface IRedisPluginParams {
  readonly key: string;
  readonly format: "json" | "yaml";
}

export const createRedisPlugin = (
  client: RedisClient,
): ResolverPlugin<IRedisPluginParams> => {
  const get = promisify(client.get).bind(client);
  const RedisPlugin: ResolverPlugin<IRedisPluginParams> = {
    parse: (params) => {
      if (typeof params !== "object" || params === null) {
        throw new TypeError();
      }
      const { key, format } = params as IRedisPluginParams;

      if (typeof key !== "string") {
        throw new TypeError();
      }

      if (format !== "json" && format !== "yaml") {
        throw new TypeError();
      }

      return { key, format };
    },

    unref: async ({ key, format }) => {
      const value = await get(key);
      if (!value) {
        throw new Error("not found");
      }
      if (format === "json") {
        return JSON.parse(value);
      }
      return safeLoad(value);
    },
  };

  return RedisPlugin;
};
