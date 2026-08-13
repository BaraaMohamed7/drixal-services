import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-mongoose"],
  colorMode: {
    preference: "light",
    fallback: "light",
  },
  mongoose: {
    uri: process.env.NUXT_MONGOOSE_URI || process.env.MONGODB_URI || "",
    modelsDir: "models",
  },
  css: ["~/assets/css/main.css"],
  icon: {
    clientBundle: {
      scan: true,
      icons: [
        "lucide:layout-dashboard",
        "lucide:building-2",
        "lucide:building",
        "lucide:briefcase-business",
        "lucide:inbox",
        "lucide:users",
        "lucide:clipboard-list",
        "lucide:calendar-days",
        "lucide:clipboard-check",
        "lucide:calendar-clock",
        "lucide:messages-square",
        "lucide:receipt-text",
        "lucide:store",
        "lucide:log-out",
        "lucide:menu",
        "lucide:x",
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
