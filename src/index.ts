import { createSmarty } from "./core/client.js";

const smarty = createSmarty();

const res = await smarty.fetch("https://api.ipify.org", {
  strategy: "tor",
});

console.log(res);
