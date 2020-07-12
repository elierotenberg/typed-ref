import { ResolverPlugin } from "../Ref";

export interface IInlineRefParams {
  readonly value: unknown;
}

export const InlinePlugin: ResolverPlugin<IInlineRefParams> = {
  unref: async ({ value }) => {
    return value;
  },
  parse: (params) => {
    if (typeof params !== "object" || params === null) {
      throw TypeError();
    }
    const { value } = params as Record<string, unknown>;
    return { value };
  },
};
