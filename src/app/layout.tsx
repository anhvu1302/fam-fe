import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AntdRegistry } from "@ant-design/nextjs-registry";

import AppInitializer from "@/components/AppInitializer";
import ThemeConfigProvider from "@/components/ThemeConfigProvider";
import ThemeFloatButton from "@/components/ThemeFloatButton";
import { I18nProvider } from "@/lib/i18n-context";
import { SettingsProvider } from "@/lib/settings-context";
import { ThemeProvider } from "@/lib/theme-context";
import { UserProvider } from "@/lib/user-context";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fixed Asset Management",
  description: "Hệ thống quản lý tài sản cố định",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ThemeProvider>
            <ThemeConfigProvider>
              <SettingsProvider>
                <UserProvider>
                  <I18nProvider>
                    <AppInitializer>
                      {children}
                    </AppInitializer>
                    <ThemeFloatButton />
                  </I18nProvider>
                </UserProvider>
              </SettingsProvider>
            </ThemeConfigProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
