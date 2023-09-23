import type { GetState, SetState } from "zustand";

export type StoreSlice<
  T extends Record<string, unknown>,
  E extends Record<string, unknown> = T
> = (
  set: SetState<E extends T ? E : E & T>,
  get: GetState<E extends T ? E : E & T>
) => T;
