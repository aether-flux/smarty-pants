import { directStrategy } from "../strategies/direct.js"
import { torStrategy } from "../strategies/tor.js"
import { SmartReqOptions, SmartResponse } from "./types.js";
import { runEngine } from "./engine.js";

export const createSmarty = () => {
  let strategies = [directStrategy, torStrategy];

  return {
    async fetch(url: string, options: SmartReqOptions = {}): Promise<SmartResponse> {
      if (options.strategy === 'direct') {
        strategies = [directStrategy];
      } else if (options.strategy === 'tor') {
        strategies = [torStrategy];
      }
      
      // if (options.debug) {
      //   return Promise.all(
      //     strategies.map(async (s) => {
      //       try {
      //         const res = await s.execute(url, options);
      //         return {
      //           strategy: s.name,
      //           status: res.status,
      //           data: await res.text(),
      //         };
      //       } catch(e: any) {
      //         return { strategy: s.name, error: true }
      //       }
      //     })
      //   );
      // }

      return runEngine(url, options, strategies);
    }
  }
}
