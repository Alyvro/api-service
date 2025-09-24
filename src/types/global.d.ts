import type { ReturnFunction } from "./cache";
import type { RetryOptions } from "./retry";

export {};

declare global {
  type ApiExteraConfigRequest = {
    secret?: Partial<{
      body: boolean;
    }>;
    status?: boolean;
    plugins?: Partial<{
      cache: ReturnFunction;
      compressor: boolean;
      retry: Partial<RetryOptions>;
    }>;
  };
}
