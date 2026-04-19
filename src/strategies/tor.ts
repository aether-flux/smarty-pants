import { Strategy } from "../core/types.js";
import { ProxyAgent } from "undici";

const dispatcher = new ProxyAgent("socks5://127.0.0.1:9050");

export const torStrategy: Strategy = {
  name: "tor",

  async execute(url, options) {
    const timeout = options.timeout ?? 5000;
    let retries = options.retries ?? 3;
    let lasterror: any;

    while (retries > 0) {
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
          signal: controller.signal,
        } as any);

        clearTimeout(timeoutId);

        if (!res.ok) {
          retries--;
          if (retries === 0) {
            throw new Error('Tor strategy failed (bad status)');
          }
          continue;
        }

        return res;
      } catch(e: any) {
        clearTimeout(timeoutId);
        retries--;
        if (retries === 0) {
          throw new Error(`Tor strategy failed: ${e.message}`);
        }

        if (e.name === "AbortError") {
          lasterror = new Error("Tor strategy timeout");
        } else {
          lasterror = e;
        }
      }
    }

    throw lasterror || new Error("Unreachable")
  }
}
