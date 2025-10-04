import type { AxiosBasicCredentials } from "axios";

export type ConfigEnvType = {
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
};

export type ConfigSettingType = {
  /**
   * if error in server side, api-service send error message for your telegram bot
   * @default false
   */
  telegram: boolean;
};

export type ConfigMiddlewareHeadersType = {
  /**
   * @default "x-alyvro-status"
   */
  status: string;

  /**
   * @default "x-alyvro-api-key"
   */
  apiKey: string;

  /**
   * @default "x-alyvro-body-type"
   */
  bodyType: string;
};

export type ConfigMiddlewareErrorsType = {
  /**
   * @default "no access to this api"
   */
  forbidden: string;
};

export type ConfigMiddlewareType = {
  headers: Partial<ConfigMiddlewareHeadersType>;

  errors: Partial<ConfigMiddlewareErrorsType>;

  skip_routers: string[];

  /**
   * @default "alvyro"
   */
  powerd_by: string;
};

export type ApiTypes = {
  prefix: string;
  data_returns: any;
};

export type ConfigType = {
  url: string;
  logger?: boolean;
  auth?: AxiosBasicCredentials;
  env?: ConfigEnvType;
  setting?: Partial<ConfigSettingType>;
  middleware?: Partial<ConfigMiddlewareType>;
  api_types?: ApiTypes[];
};
