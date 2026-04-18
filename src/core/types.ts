export type StrategyName = "direct" | "tor";
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface Strategy {
  name: StrategyName,
  execute(url: string, options: SmartReqOptions): Promise<Response>,
}

export interface SmartReqOptions {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;

  strategy?: StrategyName | "auto";
  retries?: number;
  timeout?: number;

  debug?: boolean;
}

export interface SmartResponse {
  data: any;
  status: number;

  meta: {
    strategy: StrategyName;
    attempts: number;
    duration: number;
    fallbackUsed: boolean;
  };
}
