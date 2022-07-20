# make-it-cacheable

## Library agnostic caching 🥇

### Can make the selected methods cached

- The tool only makes the selected methods cached
- The cache is invalidated using a custom TTL


### Usage

#### ESM 
`import makeCacheable from "make-it-cacheable"`
#### CommonJS
`const makeCacheable = require("make-it-cacheable");`

#### With Axios

```javascript
// Axios demo
import makeCacheable from "make-it-cacheable";
import axios from "axios"; // make sure to install axios before trying this demo
(async () => {
  const methods = ["get"]; // select the methods that will be cached
  const ttl = 10000; // set the cache TTL (in miliseconds)
  const debug = true; // optional
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
```

#### With a Custom implementation

```javascript
// CUSTOM Function demo
import makeCacheable from "make-it-cacheable";

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
  const cacheable = makeCacheable(test, { methods, ttl });

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
```
