interface IRef<T extends string, P> {
  readonly $ref: {
    readonly kind: T;
    readonly params: P;
  };
}

export type ResolverPlugin<P> = {
  readonly unref: (params: P) => Promise<unknown>;
  readonly parse: (params: unknown) => P;
};

type ResolverPlugins<
  T extends string,
  P extends {
    readonly [K in T]: unknown;
  }
> = {
  readonly [K in T]: ResolverPlugin<P[K]>;
};

export class Resolver<
  T extends string,
  P extends {
    readonly [K in T]: unknown;
  }
> {
  private readonly plugins: ResolverPlugins<T, P>;

  public constructor(plugins: ResolverPlugins<T, P>) {
    this.plugins = plugins;
  }

  public unref = async (ref: IRef<T, P[T]>): Promise<unknown> => {
    const {
      $ref: { kind, params },
    } = ref;

    const { unref, parse } = this.plugins[kind];

    return await unref(parse(params));
  };
}
