import type { AxiosBasicCredentials } from "axios";
import { ZodTypeAny } from "zod";

export type ConfigEnvType = {
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
};

export type ConfigSettingType = {
  /**
   * if error in server side, api-service send error message for your telegram bot
   */
  telegram: boolean;
};

export type ApiTypes<T extends ZodTypeAny = ZodTypeAny> = {
  url: string;
  type: T;
};

export type ConfigType = {
  api_url: string;
  logger?: boolean;
  auth?: AxiosBasicCredentials;
  env?: ConfigEnvType;
  api_types?: ApiTypes[];
  setting?: Partial<ConfigSettingType>;
};
