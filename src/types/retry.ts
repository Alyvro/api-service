import type { AxiosRequestConfig } from "axios";

export interface RetryOptions {
  retries?: number;
  retryDelay?: number;
  backoff?: boolean;
}

export interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  __retryCount?: number;
}
