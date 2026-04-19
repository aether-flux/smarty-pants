import { directStrategy } from "../strategies/direct.js"
import { torStrategy } from "../strategies/tor.js"
import { SmartReqOptions, SmartResponse } from "./types.js";
import { runEngine } from "./engine.js";
import { resolveStrategies } from "../utils/getStrategyByName.js";

export const createSmarty = () => {
  return {
    async fetch(url: string, options: SmartReqOptions = {}): Promise<SmartResponse> {
      const strat = options.strategy ?? "auto";
      let strategies = resolveStrategies(strat);

      return runEngine(url, options, strategies);
    }
  }
}
