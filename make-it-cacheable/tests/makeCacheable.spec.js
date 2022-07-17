import test from "ava";
import sinon from "sinon";
import makeCacheable from "../lib/makeCacheable.js";

let clock;

test.before(() => {
  clock = sinon.useFakeTimers();
});
test.after(() => {
  clock.restore();
});

test('"makeCacheable" should work as expected with cached methods', (t) => {
  const api = {
    get: () => {
      data: "get";
    },
    post: (msg) => {
      data: "post";
    },
  };
  const getSpy = sinon.spy(api, "get");
  const postSpy = sinon.spy(api, "post");

  const cacheableApi = makeCacheable(api, { methods: ["get"], ttl: 1000 });

  cacheableApi.get();
  cacheableApi.get();
  cacheableApi.post();
  cacheableApi.post();

  // the "get" method was called only once because it was cached
  t.truthy(getSpy.calledOnce);
  // the "post" was called twice as we did not cache it!
  t.truthy(postSpy.calledTwice);
});

test('"makeCacheable" should work as expected with expiring TTLs', (t) => {
  const api = {
    get: () => {
      data: "get";
    },
  };
  const getSpy = sinon.spy(api, "get");

  const cacheableApi = makeCacheable(api, { methods: ["get"], ttl: 1000 });

  cacheableApi.get();
  // more time than the TTL was passed, no caching !
  clock.tick(1500);
  // this won't be cached as the TTL was expired!
  cacheableApi.get();
  // this will be cached
  cacheableApi.get();

  t.truthy(getSpy.calledTwice);
});

test('"makeCacheable" should work as expected with cached methods that return promises', async (t) => {
  const api = {
    get: () => Promise.resolve("test"),
  };
  const getSpy = sinon.spy(api, "get");

  const cacheableApi = makeCacheable(api, { methods: ["get"], ttl: 1000 });

  const nonCachedVal = await cacheableApi.get();
  // more time than the TTL was passed, no caching !
  clock.tick(1500);
  // this won't be cached as the TTL was expired!
  await cacheableApi.get();
  // this will be cached
  const cachedVal = await cacheableApi.get();

  t.truthy(getSpy.calledTwice);
  t.is(nonCachedVal, cachedVal);
  t.is(cachedVal, "test");
});
