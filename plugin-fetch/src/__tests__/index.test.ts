import fastify from "fastify";
import {
  Resolver,
  FilePlugin,
  InlinePlugin,
  IFileRefParams,
  IInlineRefParams,
  extend,
} from "typed-ref-core";

import { FetchPlugin, IFetchPluginParams } from "../FetchPlugin";

const testServer = fastify();

const TEST_PORT = 9982;

const expected = {
  hello: "world",
  one: 1,
  two: 2,
  array: [],
};

const expectedGet = {
  ...expected,
  myMethod: "get",
};

const expectedPost = {
  ...expected,
  myMethod: "post",
};

const headers = {
  username: "myself",
  password: "some password",
};

testServer.get("/ref.json", async () => expectedGet);
testServer.post("/ref.json", async () => expectedPost);
testServer.post("/ref-with-credentials.json", async (request) => {
  const { username, password } = request.headers;
  if (username !== "myself") {
    throw new Error("wrong username");
  }
  if (password !== "some password") {
    throw new Error("wrong password");
  }
  return expectedPost;
});

beforeAll(async () => {
  await testServer.listen(TEST_PORT);
});

afterAll(async () => {
  await testServer.close();
});

describe("FetchPlugin", () => {
  test("get", async () => {
    const ref = {
      $ref: {
        kind: "fetch",
        params: {
          href: `http://localhost:${TEST_PORT}/ref.json`,
        },
      },
    } as const;

    const resolver = new Resolver<
      "fetch",
      {
        readonly fetch: IFetchPluginParams;
      }
    >({
      fetch: FetchPlugin,
    });

    expect(await resolver.unref(ref)).toEqual(expectedGet);
  });

  test("post", async () => {
    const ref = {
      $ref: {
        kind: "fetch",
        params: {
          href: `http://localhost:${TEST_PORT}/ref.json`,
          method: "post",
        },
      },
    } as const;

    const resolver = new Resolver<
      "fetch",
      {
        readonly fetch: IFetchPluginParams;
      }
    >({
      fetch: FetchPlugin,
    });

    expect(await resolver.unref(ref)).toEqual(expectedPost);
  });

  test("post with headers", async () => {
    const ref = {
      $ref: {
        kind: "fetch",
        params: {
          href: `http://localhost:${TEST_PORT}/ref-with-credentials.json`,
          method: "post",
          headers,
        },
      },
    } as const;

    const resolver = new Resolver<
      "fetch",
      {
        readonly fetch: IFetchPluginParams;
      }
    >({
      fetch: FetchPlugin,
    });

    expect(await resolver.unref(ref)).toEqual(expectedPost);

    const refWithoutHeaders = {
      ...ref,
      $ref: {
        ...ref.$ref,
        params: {
          ...ref.$ref.params,
          headers: {},
        },
      },
    } as const;

    await expect(
      async () => await resolver.unref(refWithoutHeaders),
    ).rejects.toBeTruthy();
  });

  test("post with headers in extend plugin", async () => {
    const ref = {
      $ref: {
        kind: "fetch",
        params: {
          href: `http://localhost:${TEST_PORT}/ref-with-credentials.json`,
          method: "post",
        },
      },
    } as const;

    const CustomFetchPlugin = extend(FetchPlugin, (params) => ({
      ...params,
      headers: {
        ...params.headers,
        username: headers.username,
        password: headers.password,
      },
    }));

    const resolver = new Resolver<
      "fetch",
      {
        readonly fetch: IFetchPluginParams;
      }
    >({
      fetch: CustomFetchPlugin,
    });

    expect(await resolver.unref(ref)).toEqual(expectedPost);
  });
});

describe("Combined", () => {
  test("file + inline + fetch", async () => {
    const fileRef = {
      $ref: {
        kind: "file",
        params: {
          format: "yaml",
          path: "src/__tests__/ref.yml",
        },
      },
    } as const;

    const inlineRef = {
      $ref: {
        kind: "inline",
        params: {
          value: expectedGet,
        },
      },
    } as const;

    const fetchRef = {
      $ref: {
        kind: "fetch",
        params: {
          href: `http://localhost:${TEST_PORT}/ref.json`,
        },
      },
    } as const;

    const resolver = new Resolver<
      "file" | "inline" | "fetch",
      {
        readonly file: IFileRefParams;
        readonly inline: IInlineRefParams;
        readonly fetch: IFetchPluginParams;
      }
    >({
      file: FilePlugin,
      inline: InlinePlugin,
      fetch: FetchPlugin,
    });

    for (const ref of [fileRef, inlineRef, fetchRef] as const) {
      expect(await resolver.unref(ref)).toEqual(expectedGet);
    }
  });
});
