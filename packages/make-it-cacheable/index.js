import axios from "axios";
import makeCacheable from "./src/makeCacheable.js";

// CUSTOM Function thenable demo
(async () => {
  const test = {
    getHello: (msg) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("NON cached", msg);
          resolve({ message: `Hello ${msg}` });
        }, 3000);
      });
    },
    getRandomNumber: () => {
      console.log("NON cached", "getRandomNumber");
      return Math.random();
    },
    getLatest: (msg) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("NEVER cached", msg);
          resolve({ message: `Hello ${msg}` });
        }, 500);
      });
    },
  };

  const methods = ["getHello", "getRandomNumber"];
  const ttl = 3000;
  const debug = true;
  const cacheable = makeCacheable(test, { methods, ttl, debug });

  await Promise.all([
    cacheable.getHello("world"),
    cacheable.getHello("beatiful world"),
  ]);
  console.log(await cacheable.getHello("beatiful world"));
  console.log(await cacheable.getHello("new world"));
  console.log(await cacheable.getHello("world"));
  console.log(await cacheable.getHello("world 2"));
  await Promise.all([
    cacheable.getHello("new world"),
    cacheable.getHello("world"),
  ]);

  // Never cached !!!
  console.log(await cacheable.getLatest("world"));
  console.log(await cacheable.getLatest("world"));
  console.log(await cacheable.getLatest("world"));

  console.log(cacheable.getRandomNumber());
  console.log(cacheable.getRandomNumber());
  console.log(await cacheable.getHello("world is new"));
})();

// Axios demo
(async () => {
  const methods = ["get", "post"];
  const ttl = 3000;
  const debug = true;
  const cachedAxios = makeCacheable(axios, { methods, ttl, debug });
  try {
    const getData = await cachedAxios.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    console.log(getData.data);
    const cachedGetData = await cachedAxios.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    console.log(cachedGetData.data);
  } catch (error) {
    console.log(error);
  }
})();
