import "axios";
import { ReturnFunction } from "./cache";
import { RetryOptions } from "./retry";

declare module "axios" {
  export interface AxiosRequestConfig {
    secret?: Partial<{
      body: boolean;
    }>;
    status?: boolean;
    plugins?: Partial<{
      cache: ReturnFunction;
      compressor: boolean;
      retry: Partial<RetryOptions>;
    }>;
  }
}

export {};
