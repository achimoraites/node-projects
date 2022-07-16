export default class ProxyCache {
    #memory;
    #timeout;
    #ttl;
  
    constructor(ttl) {
      this.#memory = new Map();
      this.#timeout = new Map();
      this.#ttl = ttl;
    }
  
    set(key, value) {
      this.#memory.set(key, value);
      this.#cacheInvalidation(key);
    }
  
    has(key) {
      return this.#memory.has(key);
    }
  
    get(key) {
      return this.#memory.get(key);
    }
  
    delete(key) {
      this.#memory.delete(key);
    }
  
    #cacheInvalidation(key) {
      if (this.#timeout.has(key)) {
        clearTimeout(this.#timeout.get(key));
      }
      this.#timeout.set(
        key,
        setTimeout(() => {
          console.log("invalidated::", key);
          this.#memory.delete(key);
          this.#timeout.delete(key);
        }, this.#ttl)
      );
    }
  }