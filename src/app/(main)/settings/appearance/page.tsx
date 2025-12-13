"use client";

import { useEffect, useState } from "react";

import { BgColorsOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Card, message, Radio, Space, Spin, Typography } from "antd";

import themeApi from "@/lib/api/theme";

const { Title, Text } = Typography;

export default function AppearanceSettingsPage() {
    const [messageApi, messageContextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
    const [language, setLanguage] = useState<"en" | "vi">("vi");

    // Load user theme on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const data = await themeApi.getUserTheme();
            setTheme(data.theme as "light" | "dark" | "auto");
            setLanguage(data.language as "en" | "vi");
        } catch (_error) {
            messageApi.error("Không thể tải cài đặt giao diện");
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = async (value: "light" | "dark" | "auto") => {
        setSaving(true);
        try {
            await themeApi.updateUserTheme({ theme: value });
            setTheme(value);
            localStorage.setItem("theme", value);
            messageApi.success("Đã cập nhật theme");
        } catch (_error) {
            messageApi.error("Không thể cập nhật theme");
        } finally {
            setSaving(false);
        }
    };

    const handleLanguageChange = async (value: "en" | "vi") => {
        setSaving(true);
        try {
            await themeApi.updateUserTheme({ language: value });
            setLanguage(value);
            localStorage.setItem("language", value);
            messageApi.success("Đã cập nhật ngôn ngữ");
        } catch (_error) {
            messageApi.error("Không thể cập nhật ngôn ngữ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                {messageContextHolder}
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </>
        );
    }

    return (
        <>
            {messageContextHolder}
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Title level={2} className="mb-2">
                        Appearance
                    </Title>
                    <Text type="secondary">
                        Customize how the application looks and feels
                    </Text>
                </div>

                {/* Theme Settings */}
                <Card className="mb-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                            <BgColorsOutlined className="text-xl text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <Title level={4} className="mb-2">
                                Theme
                            </Title>
                            <Text type="secondary" className="mb-4 block">
                                Choose your preferred color scheme
                            </Text>

                            <Radio.Group
                                value={theme}
                                onChange={(e) => handleThemeChange(e.target.value)}
                                disabled={saving}
                            >
                                <Space style={{ flexDirection: 'column' }} size="middle">
                                    <Radio value="light">
                                        <Space>
                                            <SunOutlined />
                                            <span>Light</span>
                                        </Space>
                                    </Radio>
                                    <Radio value="dark">
                                        <Space>
                                            <MoonOutlined />
                                            <span>Dark</span>
                                        </Space>
                                    </Radio>
                                    <Radio value="auto">
                                        <span>Auto (match system)</span>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </div>
                    </div>
                </Card>

                {/* Language Settings */}
                <Card>
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <BgColorsOutlined className="text-xl text-green-600" />
                        </div>
                        <div className="flex-1">
                            <Title level={4} className="mb-2">
                                Language
                            </Title>
                            <Text type="secondary" className="mb-4 block">
                                Select your preferred language
                            </Text>

                            <Radio.Group
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={saving}
                            >
                                <Space style={{ flexDirection: 'column' }} size="middle">
                                    <Radio value="vi">Tiếng Việt</Radio>
                                    <Radio value="en">English</Radio>
                                </Space>
                            </Radio.Group>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
