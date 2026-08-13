import { defaultLocale, isLocaleCode, localeCodes, locales, type LocaleCode, type LocaleMessages } from "~/utils/locales";

type DotPath<T> = T extends string
  ? never
  : {
      [K in Extract<keyof T, string>]: T[K] extends string ? K : `${K}.${DotPath<T[K]>}`;
    }[Extract<keyof T, string>];

export type TranslationKey = DotPath<LocaleMessages>;

const getMessage = (messages: LocaleMessages, key: TranslationKey) =>
  key.split(".").reduce<unknown>((value, part) => (value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined), messages);

export const useLocale = () => {
  const locale = useState<LocaleCode>("locale", () => defaultLocale);

  const setLocale = (value: LocaleCode) => {
    locale.value = value;

    if (import.meta.client) {
      window.localStorage.setItem("locale", value);
      document.documentElement.lang = value;
      document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    }
  };

  if (import.meta.client) {
    const savedLocale = window.localStorage.getItem("locale");
    if (isLocaleCode(savedLocale) && savedLocale !== locale.value) setLocale(savedLocale);
  }

  useHead(() => ({
    htmlAttrs: {
      lang: locale.value,
      dir: locale.value === "ar" ? "rtl" : "ltr",
    },
  }));

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const message = getMessage(locales[locale.value], key);

    if (typeof message !== "string") return key;

    return Object.entries(params || {}).reduce((value, [param, replacement]) => value.replaceAll(`{${param}}`, String(replacement)), message);
  };

  return {
    locale,
    locales: localeCodes,
    setLocale,
    t,
  };
};
