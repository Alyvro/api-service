import type { AlyvroAxiosInstance, AlyvroInternalConfig } from "@/types/api";
import type { AxiosError } from "axios";

export const retry = (instance: AlyvroAxiosInstance) => {
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError & { config?: AlyvroInternalConfig }) => {
      const config = error.config;
      const retryOpts = config?.plugins?.retry;

      if (!config || !retryOpts) throw error;

      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount >= (retryOpts.retries ?? 3)) throw error;

      config.__retryCount += 1;

      const delay = retryOpts.backoff
        ? (retryOpts.retryDelay ?? 1000) * 2 ** (config.__retryCount - 1)
        : retryOpts.retryDelay ?? 1000;

      await new Promise((res) => setTimeout(res, delay));

      if (!config.url) throw error;

      return instance.request(config as any);
    }
  );
};
