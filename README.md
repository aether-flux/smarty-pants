# Smarty Pants  ᕙ(•̀ ᗜ •́)ᕗ
A pluggable smart request engine with retry, fallback, and strategy-based execution.

---

## Why?
Making HTTP requests sounds pretty simple, but turns out it isn't:
- Requests fail
- APIs timeout
- Different networks behave differently
- Retrying manually is troublesome

**Smarty Pants** solves this by introducing **strategy-based execution**:
> Try -> Retry -> Fallback to different strategy -> Retry -> Observe

---

## Installation
```bash
npm install smarty-pants
```

## Example Usage
```js
import { Smarty } from 'smarty-pants';

const smarty = new Smarty();
const res = await smarty.fetch("http://example.com", {
    strategy: 'direct',     // default: auto
    timeout: 5000,          // default: 10000
    method: 'POST',         // default: null (GET)
});

console.log(res);
```

---

## How It Works
Smarty pants uses **strategies** to execute requests.
Each strategy:
- tries the request
- retries if needed
- fails gracefully and falls back to next strategy

## Built-in Strategies
### `direct`
Normal HTTP request using fetch.

### `tor`
Routes request through a SOCKS proxy (eg, Tor)
> ⚠️ Requires a running proxy (like Tor on 1127.0.0.1:9050)

## `auto` Mode Default
Automatically tries strategies in order.

It has light adaptive behavior:
> The last successful strategy is tried first during the next request.

---

## Response Structure
```ts
{
  data: any | null,
  status: number | null,

  error?: {
    message: string,
    strategy?: string
  },

  meta: {
    strategy: string | null,
    attempts: number,
    duration: number,
    fallbackUsed: boolean,
    timeline: [
      {
        type: "start" | "success" | "failed" | "timeout",
        strategy: string,
        time: number,
        message?: string
      }
    ]
  }
}
```

### Example output
```json
{
  "data": "<html>...</html>",
  "status": 200,
  "meta": {
    "strategy": "tor",
    "attempts": 2,
    "duration": 5609,
    "fallbackUsed": true,
    "timeline": [
      { "type": "start", "strategy": "direct", "time": 0 },
      { "type": "failed", "strategy": "direct", "time": 5002 },
      { "type": "start", "strategy": "tor", "time": 5002 },
      { "type": "success", "strategy": "tor", "time": 5609 }
    ]
  }
}
```

---

## 🔌 Custom Strategies
You can plug in your own strategies as well!
For example:
```ts
import { Smarty, Strategy } from "smarty-pants";

const mystrat: Strategy = {
  name: "mystrat",

  async execute(url, options) {
    const res = await fetch(url, options);
    return res;
  }
};

const smarty = new Smarty().addStrategy(mystrat);
const res = await smarty.fetch("http://example.com", { strategy: ["mystrat", "direct"] });      // 'strategy' value must be same as 'name' field in your strategy
```

### Strategy Interface
```ts
interface Strategy {
    name: string;
    execute(
        url: string,
        options: SmartReqOptions,
        signal?: AbortSignal
    ): Promise<SmartResponse>;
```

### Options
```ts
{
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  headers?: Record<string, string>;
  body?: any;

  strategy?: StrategyInput<T>;
  retries?: number;             // per strategy
  timeout?: number;             // per attempt
  maxDuration?: number;         // total request time
}
```

---

## Timeline
Every response includes a **timeline**:
- when each strategy started
- when it failed
- when fallback happened
- when it succeeded

This makes debugging network issues way easier.

## Design Philosophy
- Minimal core
- Extensible via custom strategies
- No unnecessary abstractions

---

## License
MIT
