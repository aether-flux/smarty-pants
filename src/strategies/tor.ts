import { mergeSignals } from "../utils/mergeSignals.js";
import { Strategy } from "../core/types.js";
import { ProxyAgent } from "undici";

const dispatcher = new ProxyAgent("socks5://127.0.0.1:9050");

export const torStrategy: Strategy = {
  name: "tor",

  async execute(url, options, globalSignal) {
    const timeout = options.timeout ?? 10000;
    let retries = options.retries ?? 3;
    let lasterror: any;

    while (retries > 0) {
      if (globalSignal?.aborted) {
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
          dispatcher,
          signal: mergeSignals(controller.signal, globalSignal),
        } as any);

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

        if (globalSignal?.aborted) {
          throw new Error("Global timeout exceeded");
        }

        if (e.name === "AbortError") {
          lasterror = new Error("Tor strategy timeout");
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
