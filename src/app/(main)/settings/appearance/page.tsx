"use client";

import { useState } from "react";

import { BgColorsOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Card, Radio, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function AppearanceSettingsPage() {
    const [theme, setTheme] = useState<"light" | "dark" | "auto">(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as "light" | "dark" | "auto") || "light";
        }
        return "light";
    });
    const [language, setLanguage] = useState<"en" | "vi">(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("language") as "en" | "vi") || "vi";
        }
        return "vi";
    });

    const handleThemeChange = (value: "light" | "dark" | "auto") => {
        setTheme(value);
        localStorage.setItem("theme", value);
        // TODO: Implement theme switching logic
    };

    const handleLanguageChange = (value: "en" | "vi") => {
        setLanguage(value);
        localStorage.setItem("language", value);
        // TODO: Implement language switching logic
    };

    return (
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
    );
}
