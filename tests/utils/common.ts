// print util
export const readableTokenAcc = (account: any) => {
  let readablePrint = {} as any;
  for (const [key, val] of Object.entries(account)) {
    readablePrint[key] = ["address", "mint", "owner"].includes(key)
      ? val.toString()
      : val;
  }
  return readablePrint;
};

// sleep util
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
