export type StrategyName = "direct" | "tor";
export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface Strategy {
  name: StrategyName,
  execute(url: string, options: SmartReqOptions, signal: AbortSignal): Promise<Response>,
}

export interface SmartReqOptions {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;

  strategy?: StrategyName | "auto";
  retries?: number;
  timeout?: number;
  maxDuration?: number;
}

export type TimelineEvent = {
  time?: number;
  strategy: StrategyName | null;
  type: "start" | "success" | "failed" | "timeout";
  message?: string;
};

export interface SmartResponse {
  data: any | null;
  status: number | null;

  error?: {
    message: string;
    strategy?: StrategyName;
  };

  meta: {
    strategy: StrategyName | null;
    attempts: number;
    timeline: TimelineEvent[];
    duration: number;
    fallbackUsed: boolean;
  };
}
