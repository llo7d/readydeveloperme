import create, { GetState, SetState } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import createThemeSlice from "./slices/themeSlice";

const createRootSlice = (set: SetState<any>, get: GetState<any>) => ({
  ...createThemeSlice(set, get),
});

export const useStore = create(
  persist(createRootSlice, {
    name: "storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      theme: state.theme,
    }),
  })
);
