"use client";

import { useEffect, useRef, useState } from "react";

import { BgColorsOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Card, message, Radio, Space, Spin, Typography } from "antd";

import themeApi from "@/lib/api/theme";
import { useApiError } from "@/lib/hooks/use-api-error";

const { Title, Text } = Typography;

export default function AppearanceSettingsPage() {
    const [messageApi, messageContextHolder] = message.useMessage();
    const { formatError } = useApiError();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
    const [language, setLanguage] = useState<"en" | "vi">("vi");
    const loadedRef = useRef(false);

    // Load user theme on mount
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadTheme = async () => {
            try {
                const response = await themeApi.getUserTheme();
                if (!response.success) {
                    const formattedError = formatError(response);
                    messageApi[formattedError.type](formattedError.message);
                    return;
                }
                const data = response.result;
                setTheme(data.theme as "light" | "dark" | "auto");
                setLanguage(data.language as "en" | "vi");
            } catch (error) {
                const formattedError = formatError(error);
                messageApi[formattedError.type](formattedError.message);
            } finally {
                setLoading(false);
            }
        };

        loadTheme();
    }, [messageApi, formatError]);

    const handleThemeChange = async (value: "light" | "dark" | "auto") => {
        setSaving(true);
        try {
            const response = await themeApi.updateUserTheme({
                theme: value,
                borderRadius: 8,
                compactMode: false,
                darkTheme: value === "dark",
                pinNavbar: false,
                transparency: 1,
            });
            if (!response.success) {
                const formattedError = formatError(response);
                messageApi[formattedError.type](formattedError.message);
                return;
            }
            setTheme(value);
            localStorage.setItem("theme", value);
            messageApi.success("Đã cập nhật theme");
        } catch (error) {
            const formattedError = formatError(error);
            messageApi[formattedError.type](formattedError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLanguageChange = (value: "en" | "vi") => {
        setLanguage(value);
        localStorage.setItem("language", value);
        messageApi.success("Đã cập nhật ngôn ngữ");
    };

    if (loading) {
        return (
            <>
                {messageContextHolder}
                <div className="flex items-center justify-center min-h-100">
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
