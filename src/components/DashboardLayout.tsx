"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  DashboardOutlined,
  FileOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Menu, message, theme } from "antd";

import authApi from "@/lib/api/auth";

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "assets",
    icon: <ToolOutlined />,
    label: "Tài sản",
    children: [
      { key: "assets-list", label: "Danh sách tài sản" },
      { key: "assets-categories", label: "Danh mục" },
      { key: "assets-depreciation", label: "Khấu hao" },
    ],
  },
  {
    key: "users",
    icon: <TeamOutlined />,
    label: "Người dùng",
  },
  {
    key: "reports",
    icon: <FileOutlined />,
    label: "Báo cáo",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Cài đặt",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
      message.success("Đăng xuất thành công!");
      router.replace("/login");
    } catch (error) {
      message.error("Đăng xuất thất bại!");
      console.error("Logout error:", error);
    }
  };

  // Handle menu item click
  const handleMenuClick = (key: string) => {
    if (key === "logout") {
      handleLogout();
    } else if (key === "profile") {
      // TODO: Navigate to profile page
      message.info("Chức năng đang phát triển");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => handleMenuClick("profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: () => handleMenuClick("logout"),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="fixed! left-0 top-0 bottom-0 z-50"
        style={{
          overflow: "auto",
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-700">
          <span className="text-lg font-bold text-white">
            {collapsed ? "FAM" : "Fixed Asset Mgmt"}
          </span>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          className="border-none"
        />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <Header
          className="sticky top-0 z-40 flex items-center justify-between px-4"
          style={{ background: colorBgContainer }}
        >
          {/* Toggle Button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          {/* User Menu */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-gray-100">
              <Avatar icon={<UserOutlined />} />
              <span className="hidden sm:inline">User</span>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content className="m-4">
          <div
            className="min-h-[calc(100vh-224px)] p-6"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer
          className="text-center"
          style={{ background: colorBgContainer }}
        >
          <div className="pt-4">
            <p className="mb-2 text-sm text-gray-600">
              Fixed Asset Management System © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-500">
              Hệ thống quản lý tài sản cố định | Version 1.0.0
            </p>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
}
