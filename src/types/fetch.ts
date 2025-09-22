export type RequestInitType = Readonly<{
  response_return?: boolean;
  response_return_status_check?: number;
  status?: boolean;
}> &
  RequestInit;
