import { Strategy } from "../core/types.js";
import { ProxyAgent } from "undici";

const dispatcher = new ProxyAgent("socks5://127.0.0.1:9050");

export const torStrategy: Strategy = {
  name: "tor",

  async execute(url, options) {
    let retries = options.retries ?? 3;
    let lasterror: any;

    while (retries > 0) {
      try {
        const res = await fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
          dispatcher,
        } as any);

        if (!res.ok) {
          retries--;
          if (retries === 0) {
            throw new Error('Tor strategy failed (bad status)');
          }
          continue;
        }

        return res;
      } catch(e: any) {
        retries--;
        if (retries === 0) {
          throw new Error("Tor strategy failed (network error)");
        }
        lasterror = e;
      }
    }

    throw lasterror || new Error("Unreachable")
  }
}
