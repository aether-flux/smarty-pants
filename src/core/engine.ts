import { SmartReqOptions, SmartResponse, Strategy, StrategyName } from "./types.js";

export async function runEngine(url: string, options: SmartReqOptions, strategies: Strategy[]): Promise<SmartResponse> {
  const start = Date.now();
  let attempts = 0;
  let lasterror: any;

  for (const strategy of strategies) {
    try {
      attempts++;

      const res = await strategy.execute(url, options);
      const data = await res.text();

      return {
        data,
        status: res.status,
        meta: {
          strategy: strategy.name,
          attempts,
          duration: Date.now() - start,
          fallbackUsed: attempts > 1,
        }
      };
    } catch(e: any) {
      lasterror = e;
      console.warn(`'${strategy.name}' failed: ${e.message}`);
      continue;
    }
  }

  return {
    data: null,
    status: null,
    error: {
      message: lasterror?.message || "All strategies failed",
    },
    meta: {
      strategy: null,
      attempts,
      duration: Date.now() - start,
      fallbackUsed: attempts > 1,
    }
  }
}
