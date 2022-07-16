import axios from "axios";
import makeCacheable from "./lib/makeCacheable.js";

// CUSTOM Function demo
(async () => {
  const test = {
    get: (url) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("NON cached", url);
          resolve({ url });
        }, 3000);
      });
    },
  };

  const methods = ["get"];
  const ttl = 3000;
  const cacheable = makeCacheable(test, methods, ttl);

  await Promise.all([cacheable.get("world is new"), cacheable.get("world")]);
  console.log(await cacheable.get("world is new"));
  console.log(await cacheable.get("world is new"));
  console.log(await cacheable.get("world"));
  console.log(await cacheable.get("world 2"));
  await Promise.all([cacheable.get("world is new"), cacheable.get("world")]);
  console.log(await cacheable.get("world is old"));
  console.log(await cacheable.get("world is new"));
})();

// Axios demo
(async () => {
  const methods = ["get", "post"];
  const ttl = 3000;
  const cachedAxios = makeCacheable(axios, methods, ttl);
  try {
    const getData = await cachedAxios.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    console.log(getData.data);
    const cachedGetData = await cachedAxios.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    console.log(cachedGetData.data)
  } catch (error) {
    console.log(error)
  }
})();
