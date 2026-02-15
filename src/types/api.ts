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

type ExtractResponse<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = S[U][M] extends { response: infer R } ? R : any;

type ExtractBody<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = S[U][M] extends { body: infer B } ? B : any;

type ExtractParams<
  S extends ServiceSchema,
  U extends keyof S,
  M extends ServiceMethod,
> = S[U][M] extends { params: infer P } ? P : any;

export type AlyvroAxiosInstance<S extends ServiceSchema = any> = Omit<
  AxiosInstance,
  "request" | "get" | "post" | "patch" | "delete" | "put"
> & {
  get<U extends keyof S>(
    url: U,
    config?: AxiosRequestConfig & { params?: ExtractParams<S, U, "GET"> },
  ): Promise<AxiosResponse<ExtractResponse<S, U, "GET">>>;

  post<U extends keyof S>(
    url: U,
    data?: ExtractBody<S, U, "POST">,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ExtractResponse<S, U, "POST">>>;

  put<U extends keyof S>(
    url: U,
    data?: ExtractBody<S, U, "PUT">,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PUT">>>;

  patch<U extends keyof S>(
    url: U,
    data?: ExtractBody<S, U, "PATCH">,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ExtractResponse<S, U, "PATCH">>>;

  delete<U extends keyof S>(
    url: U,
    config?: AxiosRequestConfig & { params?: ExtractParams<S, U, "DELETE"> },
  ): Promise<AxiosResponse<ExtractResponse<S, U, "DELETE">>>;

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
