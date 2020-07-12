import { promisify } from "util";

import { createClient } from "redis";
import { safeDump } from "js-yaml";
import { Resolver } from "typed-ref-core";

import { createRedisPlugin, IRedisPluginParams } from "../RedisPlugin";

const client = createClient({
  auth_pass: "4jEMF306thpo2a4462",
  host: "localhost",
  port: 2349,
});

const set = promisify(client.set).bind(client);
const quit = promisify(client.quit).bind(client);

const expected = {
  hello: "world",
  one: 1,
  two: 2,
  array: [],
};

beforeAll(async () => {
  await Promise.all([
    set("json", JSON.stringify(expected)),
    set("yaml", safeDump(expected)),
  ]);
});

afterAll(async () => {
  await quit();
});

describe("RedisPlugin", () => {
  test("json", async () => {
    const ref = {
      $ref: {
        kind: "redis",
        params: {
          key: "json",
          format: "json",
        },
      },
    } as const;

    const RedisPlugin = createRedisPlugin(client);

    const resolver = new Resolver<
      "redis",
      {
        readonly redis: IRedisPluginParams;
      }
    >({ redis: RedisPlugin });

    expect(await resolver.unref(ref)).toEqual(expected);
  });

  test("yaml", async () => {
    const ref = {
      $ref: {
        kind: "redis",
        params: {
          key: "yaml",
          format: "yaml",
        },
      },
    } as const;

    const RedisPlugin = createRedisPlugin(client);

    const resolver = new Resolver<
      "redis",
      {
        readonly redis: IRedisPluginParams;
      }
    >({ redis: RedisPlugin });

    expect(await resolver.unref(ref)).toEqual(expected);
  });
});
