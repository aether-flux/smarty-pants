import { Strategy } from "../core/types.js";

export const directStrategy: Strategy = {
  name: "direct",

  async execute(url, options) {
    let retries = options.retries ?? 3;
    let lasterror: any;

    while (retries > 0) {
      try {
        const res = await fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body,
        });

        if (!res.ok) {
          retries--;
          if (retries === 0) {
            throw new Error('Direct strategy failed (bad status)');
          }
          continue;
        }

        return res;
      } catch(e: any) {
        retries--;
        if (retries === 0) {
          throw new Error("Direct strategy failed (network error)");
        }
        lasterror = e;
      }
    }

    throw lasterror || new Error("Unreachable")
  }
}
