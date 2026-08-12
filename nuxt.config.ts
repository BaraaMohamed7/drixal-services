import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "nuxt-mongoose"],
  mongoose: {
    uri: process.env.NUXT_MONGOOSE_URI || process.env.MONGODB_URI || "",
    modelsDir: "models",
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
});
