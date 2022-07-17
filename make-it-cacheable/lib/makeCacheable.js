import ProxyCache from "./ProxyCache.js";

export default function makeCacheable(target, { debug, methods, ttl = 3000 }) {
  // cache
  const cache = new ProxyCache(ttl, debug);
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
          if (cache.has(cacheKey)) return cachedResponse(cacheKey);

          // Non Cached response
          return nonCachedResponse(target[property], args, cacheKey);
        };
      }

      return target[property];
    },
  });

  function getCacheKey(args, method) {
    return method + args.join("");
  }

  function nonCachedResponse(method, args, cacheKey) {
    const response = method(...args);
    // is a thenable
    if (response && typeof response.then === "function") {
      return response.then((data) => {
        cache.set(cacheKey, { type: "thenable", data });
        return data;
      });
    }

    cache.set(cacheKey, { type: "data", data: response });
    return response;
  }

  function cachedResponse(cacheKey) {
    if (debug) console.log("CACHED RESPONSE");

    const { data, type } = cache.get(cacheKey);

    // handle thenables
    if (type === "thenable") return Promise.resolve(data);

    return data;
  }
}
