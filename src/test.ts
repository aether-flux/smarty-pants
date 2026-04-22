import { Smarty } from "./core/client.js";
import { Strategy } from "./core/types.js";

const mystrat: Strategy = {
  name: 'fastaf',
  async execute(url, options) {
    try {
      const res = await fetch(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
      });
      return res;
    } catch(e: any) {
      throw new Error('haha bich');
    }
  },
}

const smarty = new Smarty().addStrategy(mystrat);

const res = await smarty.fetch("http://example.com", {
  strategy: 'auto',
});

const res2 = await smarty.fetch("https://api.ipify.com", {
  strategy: 'auto',
});

console.log(JSON.stringify(res, null, 2));
console.log(JSON.stringify(res2, null, 2));
