import ProxyCache from "./ProxyCache.js";

export default function makeCacheable(target, methods, ttl = 3000) {
  // cache
  const cache = new ProxyCache(ttl);
  return new Proxy(target, {
    get: (target, property) => {
      if (methods.includes(property)) {
        // proxied method
        return function (...args) {
          // Validation logic
          if (typeof target[property] !== "function") {
            throw Error(`${property} is not a function !`);
          }

          const cacheKey = getCacheKey(args, property);

          // Cached response
          if (cache.has(cacheKey)) {
            console.log("CACHED RESPONSE");
            return Promise.resolve(cache.get(cacheKey));
          }

          // Non Cached response
          return target[property](...args).then((v) => {
            cache.set(cacheKey, v);
            return v;
          });
        };
      }

      return target[property];
    },
  });

  function getCacheKey(args, method) {
    return method + args.join("");
  }
}
