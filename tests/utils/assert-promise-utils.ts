import { assert } from "chai";

export const assertReject = async (
  fn: () => Promise<any>,
  errorMatcher: RegExp
) => {
  try {
    await fn();
  } catch (err) {
    assert.match(JSON.stringify(err), errorMatcher);
    return;
  }
  throw Error("Promise was not rejected");
};

export const assertFulfilled = async (fn: () => Promise<any>) => {
  try {
    await fn();
  } catch (err) {
    throw Error("Promise was not fulfilled");
  }
};
