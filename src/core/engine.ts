import { SmartReqOptions, SmartResponse, Strategy, StrategyName } from "./types.js";

export async function runEngine(url: string, options: SmartReqOptions, strategies: Strategy[]): Promise<SmartResponse> {
  const start = Date.now();
  let attempts = 0;

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
      console.error(`'${strategy.name}' strategy failed, trying next strategy`);
      continue;
    }
  }

  throw new Error("All strategies failed");
}
