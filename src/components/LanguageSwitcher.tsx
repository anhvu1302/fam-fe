"use client";

import { Select } from "antd";

import { useI18n } from "@/lib/i18n-context";
import { LanguageCode } from "@/types/i18n";

export function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();

    const languageOptions = [
        { label: "Tiếng Việt", value: "vi" as LanguageCode },
        { label: "English", value: "en" as LanguageCode },
    ];

    return (
        <Select
            value={language}
            onChange={setLanguage}
            options={languageOptions}
            style={{ width: 150 }}
        />
    );
}
