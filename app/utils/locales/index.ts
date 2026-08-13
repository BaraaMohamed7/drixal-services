import { ar } from "./ar";
import { en } from "./en";

export const locales = { en, ar } as const;

export type LocaleCode = keyof typeof locales;
export type LocaleMessages = typeof en;

export const localeCodes = Object.keys(locales) as LocaleCode[];
export const defaultLocale: LocaleCode = "en";

export const isLocaleCode = (value: unknown): value is LocaleCode => typeof value === "string" && value in locales;
