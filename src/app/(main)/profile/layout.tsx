"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    CameraOutlined,
    LockOutlined,
    SafetyOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const { Sider, Content } = Layout;

interface ProfileLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        key: "profile",
        icon: <UserOutlined />,
        label: "Thông tin cá nhân",
        href: "/profile",
    },
    {
        key: "edit",
        icon: <UserOutlined />,
        label: "Sửa thông tin",
        href: "/profile/edit",
    },
    {
        key: "avatar",
        icon: <CameraOutlined />,
        label: "Đổi ảnh đại diện",
        href: "/profile/avatar",
    },
    {
        key: "password",
        icon: <LockOutlined />,
        label: "Đổi mật khẩu",
        href: "/profile/password",
    },
    {
        key: "security",
        icon: <SafetyOutlined />,
        label: "Bảo mật & 2FA",
        href: "/settings/security",
    },
];

export default function ProfileLayout({ children }: ProfileLayoutProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    // Determine active menu key
    const getActiveKey = () => {
        if (pathname === "/profile") return "profile";
        if (pathname === "/profile/edit") return "edit";
        if (pathname === "/profile/avatar") return "avatar";
        if (pathname === "/profile/password") return "password";
        if (pathname.startsWith("/settings/security")) return "security";
        return "profile";
    };

    return (
        <Layout className="min-h-screen">
            {/* Sidebar */}
            <Sider
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={250}
                theme="light"
                className="border-r border-gray-200"
            >
                <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
                    <h2 className="text-center font-semibold text-gray-800">
                        {collapsed ? "Hồ sơ" : "Hồ sơ cá nhân"}
                    </h2>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[getActiveKey()]}
                    items={menuItems.map((item) => ({
                        ...item,
                        label: <Link href={item.href}>{item.label}</Link>,
                    }))}
                />
            </Sider>

            {/* Content */}
            <Layout>
                <Content className="p-6">
                    <div className="rounded-lg bg-white p-6 shadow-sm">{children}</div>
                </Content>
            </Layout>
        </Layout>
    );
}
