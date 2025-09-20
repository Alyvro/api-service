import "axios";
import { ReturnFunction } from "./cache";

declare module "axios" {
  export interface AxiosRequestConfig {
    secret?: Partial<{
      body: boolean;
    }>;
    status?: boolean;
    plugins?: Partial<{
      cache: ReturnFunction;
      compressor: boolean;
    }>;
  }
}

export {};
