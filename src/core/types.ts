export type StrategyName = "direct" | "tor";
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface Strategy<N extends string = string> {
  name: N,
  execute(url: string, options: SmartReqOptions, signal?: AbortSignal): Promise<Response>,
}

export type StrategyInput<T extends string> = StrategyName | T | (StrategyName | T)[] | "auto";

export interface SmartReqOptions<T extends string = string> {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;

  strategy?: StrategyInput<T>;
  retries?: number;
  timeout?: number;
  maxDuration?: number;
}

export type TimelineEvent = {
  time?: number;
  strategy: string | null;
  type: "start" | "success" | "failed" | "timeout";
  message?: string;
};

export type ErrorResponse = {
  message: string;
  strategy?: string;
};

export interface SmartResponse {
  data: any | null;
  status: number | null;

  error?: ErrorResponse;

  meta: {
    strategy: string | null;
    attempts: number;
    timeline: TimelineEvent[];
    duration: number;
    fallbackUsed: boolean;
  };
}
