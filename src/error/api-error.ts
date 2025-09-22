import type { RequestInitType } from "@/types/fetch";

export class ApiError<T = any> extends Error {
  public status: number;
  public statusText: string;
  public data: T;
  public response_return_status_check?: number;
  public config: RequestInitType;

  constructor(
    status: number,
    statusText: string,
    data: T,
    config: RequestInitType
  ) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.config = config;
  }
}
