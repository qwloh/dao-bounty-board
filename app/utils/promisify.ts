export const makeNonBlocking = <T>(fn: () => T): Promise<T> =>
  new Promise((resolve) => {
    // The only way to actually make a sync operation (e.g. arr.filter / arr.sort) non blocking
    // is to queue it with setTimeout
    // Not as widely supported upcoming API: setImmediate()
    setTimeout(() => {
      resolve(fn());
    }, 0);
  });
