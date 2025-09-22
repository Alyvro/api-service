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
