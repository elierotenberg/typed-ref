import "isomorphic-unfetch";
import { ResolverPlugin } from "typed-ref-core";

export interface IFetchPluginParams {
  readonly href: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
}

export const FetchPlugin: ResolverPlugin<IFetchPluginParams> = {
  unref: async ({ href, method = "get", headers = {} }) => {
    const response = await fetch(href, {
      method,
      headers,
    });
    if (response.status >= 400) {
      throw response.statusText;
    }
    return await response.json();
  },
  parse: (params: unknown) => {
    if (typeof params !== "object" || params === null) {
      throw new TypeError();
    }
    const { href, method, headers } = params as IFetchPluginParams;
    if (typeof href !== "string") {
      throw new TypeError();
    }
    if (method && typeof method !== "string") {
      throw new TypeError();
    }
    if (headers) {
      if (typeof headers !== "object" || headers === null) {
        throw new TypeError();
      }
      if (
        Object.entries(headers).some(
          ([key, value]) =>
            typeof key !== "string" && typeof value !== "string",
        )
      ) {
        throw new TypeError();
      }
    }
    return { href, method, headers };
  },
};
