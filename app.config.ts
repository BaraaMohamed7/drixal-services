export default defineAppConfig({
  ui: {
    colors: {
      primary: "drixal-primary",
      secondary: "drixal-secondary",
      neutral: "drixal-neutral",
      success: "emerald",
      info: "sky",
      warning: "amber",
      error: "red",
    },
    badge: {
      slots: {
        base: "rounded-sm font-semibold",
      },
    },
    dropdownMenu: {
      slots: {
        content: "rounded-lg shadow-[var(--shadow-overlay)]",
      },
    },
    modal: {
      slots: {
        content: "rounded-xl shadow-[var(--shadow-overlay)]",
      },
    },
    slideover: {
      slots: {
        content: "bg-[var(--color-surface-overlay)] shadow-[var(--shadow-overlay)]",
      },
    },
  },
});
