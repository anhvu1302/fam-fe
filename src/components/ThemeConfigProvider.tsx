"use client";

import { ConfigProvider, theme } from "antd";

import { useTheme } from "@/lib/contexts/theme-context";

export default function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
    const {
        lightTheme,
        primaryColor,
        bgImg,
        borderRadius,
        compactMode,
        alpha,
    } = useTheme();

    const newTheme = lightTheme
        ? compactMode
            ? [theme.defaultAlgorithm, theme.compactAlgorithm]
            : [theme.defaultAlgorithm]
        : compactMode
            ? [theme.darkAlgorithm, theme.compactAlgorithm]
            : [theme.darkAlgorithm];

    const themeColors = {
        colorLink: primaryColor,
        colorPrimary: primaryColor,
        colorBgLayout: lightTheme
            ? `rgba(245, 245, 245, ${alpha})`
            : `rgba(8, 8, 8, ${alpha})`,
        colorBgContainer: lightTheme
            ? "rgba(255, 255, 255, 1)"
            : 'rgba(20, 20, 20, 1)'
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: newTheme,
                token: {
                    ...themeColors,
                    borderRadius: borderRadius,
                }
            }}
        >
            {bgImg && <div className={`bg-image-before ${bgImg}`}></div>}

            {children}
        </ConfigProvider>
    );
}
