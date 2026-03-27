import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

export type ServiceMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ServiceSchema = {
  [url: string]: Partial<
    Record<
      ServiceMethod,
      {
        response: any;
        body?: any;
        params?: any;
      }
    >
  >;
};

type RoutesWithMethod<S extends ServiceSchema, M extends ServiceMethod> = {
  [K in keyof S]: M extends keyof S[K] ? K : never;
}[keyof S];

type ExtractBody<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = M extends keyof S[U]
  ? S[U][M] extends { body: infer B }
    ? B
    : undefined
  : undefined;

type ExtractResponse<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = M extends keyof S[U]
  ? S[U][M] extends { response: infer R }
    ? R
    : any
  : any;

type ExtractParams<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = M extends keyof S[U]
  ? S[U][M] extends { params: infer P }
    ? P
    : undefined
  : undefined;

type ExtractPathParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractPathParams<`/${Rest}`>]: string | number }
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string | number }
      : never;

type HasPathParams<T extends string> = T extends `${string}:${string}`
  ? true
  : false;

export type RequestConfig<
  S extends ServiceSchema,
  U extends keyof S & string,
  M extends ServiceMethod,
> = Omit<AxiosRequestConfig, "params"> &
  (HasPathParams<U> extends true
    ? { path: ExtractPathParams<U> }
    : { path?: never }) &
  (ExtractParams<S, U, M> extends undefined
    ? { params?: any }
    : { params?: ExtractParams<S, U, M> });

type NoBodyArgs<
  S extends ServiceSchema,
  U extends keyof S & string,
  M extends ServiceMethod,
> =
  HasPathParams<U> extends true
    ? [url: U, config: RequestConfig<S, U, M>]
    : [url: U, config?: RequestConfig<S, U, M>];

type WithBodyArgs<
  S extends ServiceSchema,
  U extends keyof S & string,
  M extends ServiceMethod,
> =
  ExtractBody<S, U, M> extends undefined
    ? HasPathParams<U> extends true
      ? [url: U, data: any | undefined, config: RequestConfig<S, U, M>]
      : [url: U, data?: any, config?: RequestConfig<S, U, M>]
    : HasPathParams<U> extends true
      ? [url: U, data: ExtractBody<S, U, M>, config: RequestConfig<S, U, M>]
      : [url: U, data: ExtractBody<S, U, M>, config?: RequestConfig<S, U, M>];

export type AlyvroAxiosInstance<S extends ServiceSchema = any> = Omit<
  AxiosInstance,
  "request" | "get" | "post" | "patch" | "delete" | "put"
> & {
  get<U extends RoutesWithMethod<S, "GET"> & string>(
    ...args: NoBodyArgs<S, U, "GET">
  ): Promise<AxiosResponse<ExtractResponse<S, U, "GET">>>;

  delete<U extends RoutesWithMethod<S, "DELETE"> & string>(
    ...args: NoBodyArgs<S, U, "DELETE">
  ): Promise<AxiosResponse<ExtractResponse<S, U, "DELETE">>>;

  post<U extends RoutesWithMethod<S, "POST"> & string>(
    ...args: WithBodyArgs<S, U, "POST">
  ): Promise<AxiosResponse<ExtractResponse<S, U, "POST">>>;

  put<U extends RoutesWithMethod<S, "PUT"> & string>(
    ...args: WithBodyArgs<S, U, "PUT">
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PUT">>>;

  patch<U extends RoutesWithMethod<S, "PATCH"> & string>(
    ...args: WithBodyArgs<S, U, "PATCH">
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PATCH">>>;

  request<U extends keyof S & string, M extends ServiceMethod>(
    config: RequestConfig<S, U, M> & {
      url: U;
      method: M;
      data?: ExtractBody<S, U, M>;
    },
  ): Promise<AxiosResponse<ExtractResponse<S, U, M>>>;
};

export type AlyvroInternalConfig = InternalAxiosRequestConfig<any> & {
  __retryCount?: number;
  path?: Record<string, string | number>;
  plugins?: {
    retry?: {
      retries?: number;
      retryDelay?: number;
      backoff?: boolean;
    };
    cache?: Map<string, any>;
    compressor?: boolean;
  };
  secret?: { body?: boolean };
  status?: boolean;
};
