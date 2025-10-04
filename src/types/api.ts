import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

export type ApiResponseMapDefault = {
  [url: string]: any;
};

export type AlyvroAxiosInstance<
  M extends Record<string, any> = ApiResponseMapDefault
> = Omit<AxiosInstance, "request" | "get" | "post" | "patch" | "delete"> & {
  request<P extends keyof M>(
    config: AxiosRequestConfig & { url: P }
  ): Promise<AxiosResponse<M[P], any>>;

  get<P extends keyof M>(
    url: P,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<M[P], any>>;

  post<P extends keyof M, D = any>(
    url: P,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<M[P], any>>;

  patch<P extends keyof M, D = any>(
    url: P,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<M[P], any>>;

  delete<P extends keyof M, D = any>(
    url: P,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<M[P], any>>;
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
