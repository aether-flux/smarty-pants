import { SmartReqOptions, SmartResponse, Strategy, StrategyName, TimelineEvent } from "./types.js";

export async function runEngine(url: string, options: SmartReqOptions, strategies: Strategy[]): Promise<SmartResponse> {
  const start = Date.now();
  let attempts = 0;
  let lasterror: any;
  let laststrat: string | null = null;

  const timeline: TimelineEvent[] = [];
  const log = (event: TimelineEvent) => {
    timeline.push({...event, time: Date.now() - start });
  }

  const globalController = new AbortController();
  const maxDuration = options.maxDuration ?? 20000;
  let globalTimeoutId: any;

  globalTimeoutId = setTimeout(() => {
    globalController.abort();
  }, maxDuration);

  for (const strategy of strategies) {
    if (globalController.signal.aborted) {
      lasterror = new Error("Global timeout exceeded");
      laststrat = null;
      break;
    }

    log({ type: 'start', strategy: strategy.name });
    
    try {
      attempts++;

      const res = await strategy.execute(url, options, globalController.signal);
      const data = await res.text();

      clearTimeout(globalTimeoutId);
      log({ type: 'success', strategy: strategy.name });

      return {
        data,
        status: res.status,
        meta: {
          strategy: strategy.name,
          attempts,
          timeline,
          duration: Date.now() - start,
          fallbackUsed: attempts > 1,
        }
      };
    } catch(e: any) {
      log({ type: 'failed', strategy: strategy.name, message: e.message });
      lasterror = e;
      laststrat = strategy.name;
      continue;
    }
  }

  clearTimeout(globalTimeoutId);

  return {
    data: null,
    status: null,
    error: {
      message: lasterror?.message || "All stategies failed",
      ...(laststrat && { strategy: laststrat })
    },
    meta: {
      strategy: null,
      attempts,
      timeline,
      duration: Date.now() - start,
      fallbackUsed: attempts > 1,
    }
  }
}
