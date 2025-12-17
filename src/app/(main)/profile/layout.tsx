"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    CameraOutlined,
    LockOutlined,
    SafetyOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Menu, Row } from "antd";

import { useI18n } from "@/lib/contexts/i18n-context";

interface ProfileLayoutProps {
    children: ReactNode;
}

const menuItems = (t: (key: string, fallback?: string) => string) => [
    {
        key: "profile",
        icon: <UserOutlined />,
        label: t("profile.profile", "Thông tin cá nhân"),
        href: "/profile",
    },
    {
        key: "edit",
        icon: <UserOutlined />,
        label: t("profile.editProfile", "Sửa thông tin"),
        href: "/settings/profile",
    },
    {
        key: "avatar",
        icon: <CameraOutlined />,
        label: t("profile.changeAvatar", "Đổi ảnh đại diện"),
        href: "/settings/profile",
    },
    {
        key: "password",
        icon: <LockOutlined />,
        label: t("auth.changePassword", "Đổi mật khẩu"),
        href: "/settings/account",
    },
    {
        key: "security",
        icon: <SafetyOutlined />,
        label: t("settings.security", "Bảo mật & 2FA"),
        href: "/settings/security",
    },
];

export default function ProfileLayout({ children }: ProfileLayoutProps) {
    const pathname = usePathname();
    const { t } = useI18n();

    // Determine active menu key
    const getActiveKey = () => {
        if (pathname === "/profile") return "profile";
        if (pathname.startsWith("/settings/profile")) return "edit";
        if (pathname.startsWith("/settings/account")) return "password";
        if (pathname.startsWith("/settings/security")) return "security";
        return "profile";
    };

    return (
        <Row gutter={16}>
            {/* Sidebar Menu */}
            <Col xs={24} md={6}>
                <Card
                    title={t("profile.profile", "Hồ sơ cá nhân")}
                    variant="borderless"
                >
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