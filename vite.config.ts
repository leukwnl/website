import { defineConfig } from "vite";
export default defineConfig({
  publicDir: "assets", // serve /assets/** at site root
  server: { open: true },
});
