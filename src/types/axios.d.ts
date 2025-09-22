import "axios";
import { ReturnFunction } from "./cache";
import { RetryOptions } from "./retry";

declare module "axios" {
  export interface AxiosRequestConfig extends ApiExteraConfigRequest {}
}

export {};
