import { Strategy, StrategyName } from "../core/types.js"
import { directStrategy } from "../strategies/direct.js"
import { torStrategy } from "../strategies/tor.js";

export const getStrategyByName = (strat: StrategyName | "auto"): Strategy => {
  if (strat === "direct") {
    return directStrategy;
  } else if (strat === "tor") {
    return torStrategy;
  } else {
    throw new Error("Invalid strategy name.");
  }
}

export const resolveStrategies = (strategy: StrategyName | "auto"): Strategy[] => {
  if (strategy === "auto") {
    return [directStrategy, torStrategy];
  }

  return [getStrategyByName(strategy)];
}
