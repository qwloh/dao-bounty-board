export interface BountyBoardProgramAccount<T> {
  pubkey: string; // changed from PublicKey to string to encapsulate type conversion in the hooks layer
  account: T;
}

export interface CallbacksForUI {
  onSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
  onError?: (error: unknown, variables: unknown, context: unknown) => void;
}

// dumb way to exclude arrays & classes like BN or PublicKey from simple obj
// for use to construct dot notation related util types
export type SimpleObject = object & {
  length?: never;
  isEven?: never;
  toBase58?: never;
};

// dot notation typings
export type DeepKeys<T> = T extends SimpleObject
  ?
      | (keyof T & string)
      | { [P in keyof T & string]: DeepSubKeys<T, P> }[keyof T & string]
  : never;
type DeepSubKeys<T, P extends keyof T & string> = T[P] extends (infer Inner)[]
  ? `${P}.${DeepKeys<Inner>}`
  : T[P] extends object
  ? `${P}.${DeepKeys<T[P]>}`
  : never;

// get types of nested object based on dot notation path
export type DeepValue<T, K extends DeepKeys<T>> = K extends keyof T
  ? T[K]
  : K extends `${infer k}.${infer rest}`
  ? k extends keyof T
    ? rest extends DeepKeys<T[k]>
      ? DeepValue<T[k], rest>
      : never
    : never
  : never;
