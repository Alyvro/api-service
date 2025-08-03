import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    secret?: Partial<{
      body: boolean;
    }>;
    status?: boolean;
  }
}
