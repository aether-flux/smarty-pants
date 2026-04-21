import { directStrategy } from "../strategies/direct.js"
import { torStrategy } from "../strategies/tor.js"
import { SmartReqOptions, SmartResponse, Strategy, StrategyName } from "./types.js";
import { runEngine } from "./engine.js";
import { resolveStrategies } from "../utils/getStrategyByName.js";

export class Smarty<T extends string = never> {
  private strategies: Map<string, Strategy<any>>;

  constructor() {
    this.strategies = new Map();

    this.addStrategy(directStrategy);
    this.addStrategy(torStrategy);
  }

  addStrategy<N extends string>(strategy: Strategy & { name: N }): Smarty<T | N> {
    this.strategies.set(strategy.name, strategy);
    return this as unknown as Smarty<T | N>;
  }

  getStrategy(name: T | StrategyName): Strategy<T> {
    const strat = this.strategies.get(name);
    if (!strat) throw new Error(`Strategy '${name}' not found.`);
    return strat;
  }

  resolveStrategies(strategy: StrategyName | T | (StrategyName | T)[] | "auto"): Strategy[] {
    if (strategy === "auto") {
      return ['direct', 'tor'].map(name => this.getStrategy(name as T));
    }

    if (Array.isArray(strategy)) {
      return strategy.map(name => this.getStrategy(name));
    }

    return [this.getStrategy(strategy)];
  }

  async fetch(url: string, options: SmartReqOptions<T> = {}): Promise<SmartResponse> {
    const strat = options.strategy ?? "auto";
    const strats = this.resolveStrategies(strat);

    return runEngine(url, options, strats);
  }
}

// export const createSmarty = () => {
//   return {
//     async fetch(url: string, options: SmartReqOptions = {}): Promise<SmartResponse> {
//       const strat = options.strategy ?? "auto";
//       let strategies = resolveStrategies(strat);
//
//       return runEngine(url, options, strategies);
//     }
//   }
// }
