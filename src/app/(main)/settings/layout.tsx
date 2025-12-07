"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    BellOutlined,
    LockOutlined,
    SafetyOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Menu, Row } from "antd";

import { useI18n } from "@/lib/i18n-context";

interface SettingsLayoutProps {
    children: ReactNode;
}

const menuItems = (t: (key: string, fallback?: string) => string) => [
    {
        key: "profile",
        icon: <UserOutlined />,
        label: t("settings.publicProfile", "Public profile"),
        href: "/settings/profile",
    },
    {
        key: "account",
        icon: <UserOutlined />,
        label: t("settings.account", "Account"),
        href: "/settings/account",
    },
    {
        key: "appearance",
        icon: <BellOutlined />,
        label: t("settings.appearance", "Appearance"),
        href: "/settings/appearance",
    },
    {
        key: "security",
        icon: <SafetyOutlined />,
        label: t("settings.passwordAndAuthentication", "Password and authentication"),
        href: "/settings/security",
    },
    {
        key: "sessions",
        icon: <LockOutlined />,
        label: t("settings.sessions", "Sessions"),
        href: "/settings/security/sessions",
    },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();
    const { t } = useI18n();

    // Determine active menu key
    const getActiveKey = () => {
        if (pathname === "/settings/profile") return "profile";
        if (pathname === "/settings/account") return "account";
        if (pathname === "/settings/appearance") return "appearance";
        if (pathname === "/settings/security") return "security";
        if (pathname.startsWith("/settings/security/sessions")) return "sessions";
        if (pathname.startsWith("/settings/security/authentication")) return "security";
        return "profile";
    };

    return (
        <Row gutter={16}>
            {/* Sidebar Menu */}
            <Col xs={24} md={6}>
                <Card variant="borderless">
                    <Menu
                        mode="inline"
                        selectedKeys={[getActiveKey()]}
                        style={{ background: 'transparent', border: 'none' }}
                        items={menuItems(t).map((item) => ({
                            ...item,
                            label: <Link href={item.href}>{item.label}</Link>,
                        }))}
                    />
                </Card>
            </Col>

            {/* Content */}
            <Col xs={24} md={18}>
                <Card variant="borderless">
                    {children}
                </Card>
            </Col>
        </Row>
    );
}
