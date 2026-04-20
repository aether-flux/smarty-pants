import { createSmarty } from "./core/client.js";

const smarty = createSmarty();

const res = await smarty.fetch("http://example.com", {
  strategy: "auto",
});

console.log(JSON.stringify(res, null, 2));
