import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

import { antdTheme } from "@/lib/antd-theme";
import { I18nProvider } from "@/lib/i18n-context";
import { SettingsProvider } from "@/lib/settings-context";

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
          <ConfigProvider theme={antdTheme}>
            <SettingsProvider>
              <I18nProvider>{children}</I18nProvider>
            </SettingsProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
