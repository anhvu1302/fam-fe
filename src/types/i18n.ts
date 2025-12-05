// i18n types for multi-language support

export type LanguageCode = "vi" | "en";

export interface I18nMessage {
    [key: string]: string | I18nMessage;
}

export interface TranslationResource {
    common: I18nMessage;
    errors: I18nMessage;
    auth: I18nMessage;
    profile: I18nMessage;
    settings: I18nMessage;
    devices: I18nMessage;
    validation: I18nMessage;
}
