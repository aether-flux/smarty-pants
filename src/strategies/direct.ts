import { mergeSignals } from "../utils/mergeSignals.js";
import { Strategy } from "../core/types.js";

export const directStrategy: Strategy = {
  name: "direct",

  async execute(url, options, globalSignal) {
    const timeout = options.timeout ?? 5000;
    let retries = options.retries ?? 3;
    let lasterror: any;

    while (retries > 0) {
      if (globalSignal.aborted) {
        throw new Error("Global timeout exceeded");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        const res = await fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
          signal: mergeSignals(globalSignal, controller.signal),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          retries--;
          if (retries === 0) {
            throw new Error('bad status');
          }
          continue;
        }

        return res;
      } catch(e: any) {
        clearTimeout(timeoutId);

        if (globalSignal.aborted) {
          throw new Error("Global timeout exceeded");
        }

        if (e.name === "AbortError") {
          lasterror = new Error("Direct strategy timeout");
          break;
        } else {
          lasterror = e;
        }

        retries--;
        if (retries === 0) {
          throw lasterror;
        }
      }
    }

    throw lasterror || new Error("Unreachable")
  }
}
