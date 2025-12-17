"use client";

import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";

// Custom Colors
export const customColors = {
    system: {
        bgImg: "",
        color: "#1677FF",
        img: "/theme-assets/bg_main.jpg"
    },
    light: {
        bgImg: "",
        color: "#1677FF",
        img: "/theme-assets/bg_main.jpg"
    },
    dark: {
        bgImg: "",
        color: "#1677FF",
        img: "/theme-assets/bg_main.jpg"
    },
    blossom: {
        bgImg: "blossom-bg",
        color: "#ED4192",
        img: "/theme-assets/blossom.webp"
    },
    greenLeaf: {
        bgImg: "leaf-bg",
        color: "#00B96B",
        img: "/theme-assets/leaf.webp"
    },
    blueJelly: {
        bgImg: "blueJelly-bg",
        color: "#5A54F9",
        img: "/theme-assets/jelly.webp"
    }
} as const;

export type AllThemeType = keyof typeof customColors;
export type BgImgType = '' | 'blueJelly-bg' | 'blossom-bg' | 'leaf-bg';

export interface ThemeValuesType {
    lightTheme: boolean;
    primary: {
        bgImg: BgImgType;
        color: string;
    };
    borderRadius: number;
    alpha: number;
    compact: boolean;
}

export const customTheme: Record<AllThemeType, ThemeValuesType> = {
    system: {
        lightTheme: typeof window !== 'undefined'
            ? window.matchMedia('(prefers-color-scheme: light)').matches
            : true,
        primary: customColors.system,
        borderRadius: 6,
        compact: false,
        alpha: 1,
    },
    light: {
        lightTheme: true,
        primary: customColors.light,
        borderRadius: 6,
        compact: false,
        alpha: 1,
    },
    dark: {
        lightTheme: false,
        primary: customColors.dark,
        borderRadius: 6,
        compact: false,
        alpha: 1,
    },
    blossom: {
        lightTheme: true,
        primary: customColors.blossom,
        borderRadius: 10,
        compact: false,
        alpha: 0.5,
    },
    greenLeaf: {
        lightTheme: true,
        primary: customColors.greenLeaf,
        borderRadius: 6,
        compact: false,
        alpha: 0.5,
    },
    blueJelly: {
        lightTheme: false,
        primary: customColors.blueJelly,
        borderRadius: 6,
        compact: false,
        alpha: 0.7,
    },
} as const;

interface ThemeState {
    presetTheme: AllThemeType;
    lightTheme: boolean;
    navStick: boolean;
    primaryColor: string;
    bgImg: BgImgType;
    borderRadius: number;
    compactMode: boolean;
    alpha: number;
    settingsDrawer: boolean;
}

interface ThemeContextType extends ThemeState {
    togglePreset: (preset: AllThemeType) => void;
    toggleTheme: (isLight: boolean) => void;
    toggleNavStick: (stick: boolean) => void;
    setPrimaryColor: (color: string) => void;
    setBgImg: (img: BgImgType) => void;
    setBorderRadius: (radius: number) => void;
    setCompactMode: (compact: boolean) => void;
    setAlpha: (alpha: number) => void;
    toggleSettingsDrawer: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Initialize state from localStorage or default
    const [state, setState] = useState<ThemeState>(() => {
        if (typeof window === 'undefined') {
            return {
                presetTheme: 'light',
                lightTheme: true,
                navStick: false,
                primaryColor: customColors.system.color,
                bgImg: customColors.system.bgImg,
                borderRadius: 6,
                compactMode: false,
                alpha: 1,
                settingsDrawer: false,
            };
        }

        const storedTheme = localStorage.getItem('theme');
        const isLightTheme = storedTheme === 'light';
        const presetTheme: AllThemeType = !storedTheme
            ? 'system'
            : isLightTheme
                ? 'light'
                : 'dark';

        return {
            presetTheme,
            lightTheme: storedTheme ? isLightTheme : window.matchMedia('(prefers-color-scheme: light)').matches,
            navStick: false,
            primaryColor: customColors.system.color,
            bgImg: customColors.system.bgImg,
            borderRadius: 6,
            compactMode: false,
            alpha: 1,
            settingsDrawer: false,
        };
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.toggle('dark', !state.lightTheme);
    }, [state.lightTheme]);

    // Apply CSS variables
    useEffect(() => {
        const themeColors = {
            colorLink: state.primaryColor,
            colorPrimary: state.primaryColor,
            colorBgLayout: state.lightTheme
                ? `rgba(245, 245, 245, ${state.alpha})`
                : `rgba(8, 8, 8, ${state.alpha})`,
            colorBgContainer: state.lightTheme
                ? "rgba(255, 255, 255, 1)"
                : 'rgba(20, 20, 20, 1)'
        };

        Object.entries(themeColors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });

        document.documentElement.style.setProperty('--borderRadiusAnt', `${state.borderRadius}px`);
    }, [state.primaryColor, state.lightTheme, state.alpha, state.borderRadius]);

    const togglePreset = (preset: AllThemeType) => {
        setState(prev => ({ ...prev, presetTheme: preset }));
        if (preset === "system") {
            localStorage.removeItem('theme');
        }
    };

    const toggleTheme = (isLight: boolean) => {
        setState(prev => ({ ...prev, lightTheme: isLight }));
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    const toggleNavStick = (stick: boolean) => {
        setState(prev => ({ ...prev, navStick: stick }));
    };

    const setPrimaryColor = (color: string) => {
        setState(prev => ({ ...prev, primaryColor: color }));
    };

    const setBgImg = (img: BgImgType) => {
        setState(prev => ({ ...prev, bgImg: img }));
    };

    const setBorderRadius = (radius: number) => {
        setState(prev => ({ ...prev, borderRadius: radius }));
    };

    const setCompactMode = (compact: boolean) => {
        setState(prev => ({ ...prev, compactMode: compact }));
    };

    const setAlpha = (alpha: number) => {
        setState(prev => ({ ...prev, alpha: alpha }));
    };

    const toggleSettingsDrawer = (open: boolean) => {
        setState(prev => ({ ...prev, settingsDrawer: open }));
    };

    return (
        <ThemeContext.Provider
            value={{
                ...state,
                togglePreset,
                toggleTheme,
                toggleNavStick,
                setPrimaryColor,
                setBgImg,
                setBorderRadius,
                setCompactMode,
                setAlpha,
                toggleSettingsDrawer,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
