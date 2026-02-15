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

// ------------------------------------------
// Main Type Definition
// ------------------------------------------

export type AlyvroAxiosInstance<S extends ServiceSchema = any> = Omit<
  AxiosInstance,
  "request" | "get" | "post" | "patch" | "delete" | "put"
> & {
  get<U extends RoutesWithMethod<S, "GET">>(
    url: U,
    config?: AxiosRequestConfig & { params?: ExtractParams<S, U, "GET"> },
  ): Promise<AxiosResponse<ExtractResponse<S, U, "GET">>>;

  delete<U extends RoutesWithMethod<S, "DELETE">>(
    url: U,
    config?: AxiosRequestConfig & { params?: ExtractParams<S, U, "DELETE"> },
  ): Promise<AxiosResponse<ExtractResponse<S, U, "DELETE">>>;

  post<U extends RoutesWithMethod<S, "POST">>(
    url: U,
    ...args: ExtractBody<S, U, "POST"> extends undefined
      ? [data?: any, config?: AxiosRequestConfig]
      : [data: ExtractBody<S, U, "POST">, config?: AxiosRequestConfig]
  ): Promise<AxiosResponse<ExtractResponse<S, U, "POST">>>;

  // --- PUT ---
  put<U extends RoutesWithMethod<S, "PUT">>(
    url: U,
    ...args: ExtractBody<S, U, "PUT"> extends undefined
      ? [data?: any, config?: AxiosRequestConfig]
      : [data: ExtractBody<S, U, "PUT">, config?: AxiosRequestConfig]
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PUT">>>;

  // --- PATCH ---
  patch<U extends RoutesWithMethod<S, "PATCH">>(
    url: U,
    ...args: ExtractBody<S, U, "PATCH"> extends undefined
      ? [data?: any, config?: AxiosRequestConfig]
      : [data: ExtractBody<S, U, "PATCH">, config?: AxiosRequestConfig]
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PATCH">>>;

  // --- Generic Request ---
  request<U extends keyof S, M extends ServiceMethod>(
    config: AxiosRequestConfig & {
      url: U;
      method: M;
      data?: ExtractBody<S, U, M>;
      params?: ExtractParams<S, U, M>;
    },
  ): Promise<AxiosResponse<ExtractResponse<S, U, M>>>;
};

export type AlyvroInternalConfig = InternalAxiosRequestConfig<any> & {
  __retryCount?: number;
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
