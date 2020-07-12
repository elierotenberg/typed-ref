import { Resolver, extend } from "../Ref";
import { FilePlugin, IFileRefParams } from "../plugins/FilePlugin";
import { InlinePlugin, IInlineRefParams } from "../plugins/InlinePlugin";

const expected = {
  hello: "world",
  one: 1,
  two: 2,
  array: [],
};

describe("FilePlugin", () => {
  test("json only", async () => {
    const ref = {
      $ref: {
        kind: "file",
        params: {
          format: "json",
          path: "src/__tests__/ref.json",
        },
      },
    } as const;

    const resolver = new Resolver<
      "file",
      {
        readonly file: IFileRefParams;
      }
    >({
      file: FilePlugin,
    });

    const value = await resolver.unref(ref);

    expect(value).toEqual(expected);

    const invalidJsonRef = {
      $ref: {
        kind: "file",
        params: ({
          format: "not a json",
        } as unknown) as IFileRefParams,
      },
    } as const;

    await expect(
      async () => await resolver.unref(invalidJsonRef),
    ).rejects.toBeTruthy();
  });

  test("yaml only", async () => {
    const ref = {
      $ref: {
        kind: "file",
        params: {
          format: "yaml",
          path: "src/__tests__/ref.yml",
        },
      },
    } as const;

    const resolver = new Resolver<
      "file",
      {
        readonly file: IFileRefParams;
      }
    >({
      file: FilePlugin,
    });

    const value = await resolver.unref(ref);

    expect(value).toEqual(expected);

    const invalidYmlRef = {
      $ref: {
        kind: "file",
        params: ({
          format: "not a yaml",
        } as unknown) as IFileRefParams,
      },
    } as const;

    await expect(
      async () => await resolver.unref(invalidYmlRef),
    ).rejects.toBeTruthy();
  });

  test("json extend", async () => {
    const jsonRef = {
      $ref: {
        kind: "file",
        params: {
          format: "json",
          path: "src/__tests__/ref.json",
        },
      },
    } as const;

    const CustomFilePlugin = extend(FilePlugin, (params) => ({
      ...params,
      path: `${params.path}.alt`,
    }));

    const resolver = new Resolver<
      "file",
      {
        readonly file: IFileRefParams;
      }
    >({
      file: CustomFilePlugin,
    });

    const value = await resolver.unref(jsonRef);

    expect(value).toEqual({
      foo: "bar",
      one: 1,
      two: 2,
      array: [],
    });
  });

  test("json + yml", async () => {
    const jsonRef = {
      $ref: {
        kind: "file",
        params: {
          format: "json",
          path: "src/__tests__/ref.json",
        },
      },
    } as const;

    const yamlRef = {
      $ref: {
        kind: "file",
        params: {
          format: "yaml",
          path: "src/__tests__/ref.yml",
        },
      },
    } as const;

    const resolver = new Resolver<
      "file",
      {
        readonly file: IFileRefParams;
      }
    >({
      file: FilePlugin,
    });

    for (const ref of [jsonRef, yamlRef]) {
      expect(await resolver.unref(ref)).toEqual(expected);
    }
  });
});

describe("InlinePlugin", () => {
  test("inline only", async () => {
    const ref = {
      $ref: {
        kind: "inline",
        params: {
          value: {
            hello: "world",
            one: 1,
            two: 2,
            array: [],
          },
        },
      },
    } as const;

    const resolver = new Resolver<
      "inline",
      {
        readonly inline: IInlineRefParams;
      }
    >({ inline: InlinePlugin });

    expect(await resolver.unref(ref)).toEqual(expected);
  });
});

describe("Multiple plugins", () => {
  test("json + yml + inline", async () => {
    const jsonRef = {
      $ref: {
        kind: "file",
        params: {
          format: "json",
          path: "src/__tests__/ref.json",
        },
      },
    } as const;

    const yamlRef = {
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
          value: {
            hello: "world",
            one: 1,
            two: 2,
            array: [],
          },
        },
      },
    } as const;

    const resolver = new Resolver<
      "file" | "inline",
      {
        file: IFileRefParams;
        inline: IInlineRefParams;
      }
    >({
      file: FilePlugin,
      inline: InlinePlugin,
    });

    for (const ref of [jsonRef, yamlRef, inlineRef]) {
      expect(await resolver.unref(ref)).toEqual(expected);
    }
  });
});
