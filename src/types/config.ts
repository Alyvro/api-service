import type { AxiosBasicCredentials } from "axios";

export type ConfigEnvType = {
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
};

export type ConfigSettingType = {
  /**
   * if error in server side, api-service send error message for your telegram bot
   */
  telegram: {
    token: string;
    chat_id: string;
  };
};

export type ConfigType = {
  api_url: string;
  logger?: boolean;
  auth?: AxiosBasicCredentials;
  env?: ConfigEnvType;
  setting?: Partial<ConfigSettingType>;
};
