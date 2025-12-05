// App settings types based on API response

export interface AppSetting {
    key: string;
    value: string;
    dataType: number;
    group: string;
}

export interface AppSettingsMap {
    [key: string]: string;
}

export interface AppSettingsGrouped {
    [group: string]: AppSettingsMap;
}
