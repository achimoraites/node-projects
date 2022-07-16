# make-it-cachable

## Library agnostic caching 🥇

### Can make the selected methods cached

- The tool only makes the selected methods cached
- The cache is invalidated using a custom TTL

### Usage

#### Axios

```javascript
// Axios demo
(async () => {
  // select the methods that will be cached!
  const methods = ["get", "post"];
  // set the cache TTL in miliseconds
  const ttl = 3000;
  // create your cachable!
  const cachedAxios = makeCacheable(axios, methods, ttl);

  // use it !
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

#### Custom implementation

```javascript
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
```
