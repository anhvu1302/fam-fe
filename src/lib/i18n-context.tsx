"use client";

import React, { createContext, useContext, useState } from "react";

import { en } from "@/locales/en";
import { vi } from "@/locales/vi";
import { LanguageCode, TranslationResource } from "@/types/i18n";

interface I18nContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string, defaultValue?: string) => string;
    resources: TranslationResource;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_KEY = "app_language";
const SUPPORTED_LANGUAGES: Record<LanguageCode, TranslationResource> = {
    vi,
    en,
};

function getNestedValue(
    obj: Record<string, unknown>,
    path: string
): string | undefined {
    const result = path.split(".").reduce((current: unknown, key) => {
        if (current && typeof current === "object" && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);

    return typeof result === "string" ? result : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        // Initialize with stored language or default to 'vi'
        if (typeof window !== "undefined") {
            const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;
            if (
                savedLanguage &&
                Object.keys(SUPPORTED_LANGUAGES).includes(savedLanguage)
            ) {
                return savedLanguage;
            }
        }
        return "vi";
    });

    const setLanguage = (lang: LanguageCode) => {
        if (Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
            setLanguageState(lang);
            if (typeof window !== "undefined") {
                localStorage.setItem(LANGUAGE_KEY, lang);
            }
        }
    };

    const t = (key: string, defaultValue?: string): string => {
        const resources = SUPPORTED_LANGUAGES[language];
        const value = getNestedValue(
            resources as unknown as Record<string, unknown>,
            key
        );

        if (value) {
            return value;
        }

        // Try to get from English as fallback
        if (language !== "en") {
            const enValue = getNestedValue(
                SUPPORTED_LANGUAGES.en as unknown as Record<string, unknown>,
                key
            );
            if (enValue) {
                return enValue;
            }
        }

        return defaultValue || key;
    };

    return (
        <I18nContext.Provider
            value={{
                language,
                setLanguage,
                t,
                resources: SUPPORTED_LANGUAGES[language],
            }}
        >
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within I18nProvider");
    }
    return context;
}
