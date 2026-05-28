import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        body: resolve(__dirname, "body.html"),
        coregulation: resolve(__dirname, "coregulation.html"),
        quiz: resolve(__dirname, "quiz.html"),
        "scripts-free": resolve(__dirname, "scripts-free.html"),
        "decoder-free": resolve(__dirname, "decoder-free.html"),
        decoder: resolve(__dirname, "decoder.html"),
        scripts: resolve(__dirname, "scripts.html"),
      },
    },
  },
});
