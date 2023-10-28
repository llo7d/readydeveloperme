import { StoreSlice } from "../types";

type Theme = "light" | "dark";

type Slice = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const createThemeSlice: StoreSlice<Slice> = (set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
});

export default createThemeSlice;
