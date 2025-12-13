"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DashboardOutlined,
  FileOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, message, theme } from "antd";
import { Footer } from "antd/es/layout/layout";

import AuthGuard from "@/components/AuthGuard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAppSettingsByGroup } from "@/hooks/use-app-settings";
import { useAuthCheck } from "@/hooks/use-auth-check";
import { useRouteAuthSync } from "@/hooks/use-route-auth-sync";
import authApi from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n-context";
import { getMinioUrl, getUserAvatarUrl } from "@/lib/minio-url";
import { tokenStorage } from "@/lib/token-storage";
import { useUser } from "@/lib/user-context";


const { Header, Sider, Content } = Layout;



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthGuard>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();
  const { user, setUser } = useUser();

  // Call /auth/me to refresh user data on main layout mount
  useAuthCheck({
    refreshUserData: true, // This will call /auth/me
    setUser, // Save user data to context
  });

  // Sync user data with backend whenever route changes
  useRouteAuthSync();

  const {
    token: {
      colorBgContainer,
      colorText,
      colorBorder,
      boxShadowSecondary,
      borderRadiusLG,
    },
  } = theme.useToken();

  const { settings: brandingSettings } = useAppSettingsByGroup("branding");

  const rawLogo = brandingSettings["app.branding.logo"] as string | undefined;
  const logoUrl = getMinioUrl(rawLogo);

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: t("layout.nav.dashboard", "Dashboard"),
      href: "/",
    },
    {
      key: "assets",
      icon: <ToolOutlined />,
      label: t("layout.nav.assets", "Assets"),
      children: [
        { key: "assets-list", label: t("layout.nav.assetsList", "Assets List"), href: "/assets" },
        { key: "assets-categories", label: t("layout.nav.assetsCategories", "Categories"), href: "/assets/categories" },
        { key: "assets-depreciation", label: t("layout.nav.assetsDepreciation", "Depreciation"), href: "/assets/depreciation" },
      ],
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: t("layout.nav.users", "Users"),
      href: "/users",
    },
    {
      key: "reports",
      icon: <FileOutlined />,
      label: t("layout.nav.reports", "Reports"),
      href: "/reports",
    },
  ];

  return (
    <Layout className="h-screen overflow-hidden">
      {/* Sidebar */}
      <Sider
        width={200}
        collapsedWidth={80}
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="scheme-light dark:scheme-dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          scrollbarWidth: 'thin',
          backgroundColor: colorBgContainer,
          borderRight: `1px solid ${colorBorder}`,
        }}
      >
        {/* Logo */}
        <div
          className="h-16 w-full relative border-b flex items-center justify-center"
          style={{
            borderColor: colorBorder,
            color: colorText,
            backgroundColor: 'transparent'
          }}
        >
          {logoUrl ? (
            <>
              <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <Image src={logoUrl} alt="logo" width={40} height={40} className="object-contain" />
              </div>
              <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${collapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                <Image src={logoUrl} alt="logo-full" width={140} height={48} className="object-contain" />
              </div>
            </>
          ) : (
            <>
              <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <span className='text-4xl font-bold select-none'>{t("layout.logoShort")}</span>
              </div>
              <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${collapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                <span className='text-2xl font-medium select-none'>{t("layout.logoFull")}</span>
              </div>
            </>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems.map((item) => ({
            ...item,
            label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
            children: item.children?.map((child) => ({
              ...child,
              label: child.href ? <Link href={child.href}>{child.label}</Link> : child.label,
            })),
          }))}
          className="border-none"
          style={{
            background: 'transparent',
            borderColor: 'transparent'
          }}
        />
      </Sider>

      {/* Main Content */}
      <Layout className='h-screen flex flex-col'>
        {/* Header */}
        <Header
          className="sticky top-0 z-20 mt-3 mx-3 flex items-center justify-between"
          style={{
            background: colorBgContainer,
            boxShadow: boxShadowSecondary,
            borderRadius: borderRadiusLG,
            paddingLeft: 8,
            paddingRight: 16,
          }}
        >
          <div className='flex items-center gap-3'>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg h-full aspect-square flex justify-center items-center"
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Button
              type="text"
              onClick={() => router.push("/settings/profile")}
              className="flex items-center gap-2 h-auto px-2"
            >
              <Avatar
                icon={<UserOutlined />}
                src={getUserAvatarUrl(user)}
                size="small"
              />
              <span className="hidden sm:inline font-medium">{t("layout.adminName", "Admin")}</span>
            </Button>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              danger
              onClick={async () => {
                try {
                  await authApi.logout();
                  // Clear will dispatch storage event for other tabs
                  tokenStorage.clear();
                  // Redirect to login
                  router.push("/login");
                } catch (_error) {
                  message.error("Đăng xuất thất bại. Vui lòng thử lại.");
                }
              }}
            />
          </div>
        </Header>

        {/* Content */}
        <Content className="mx-3 my-6 grow overflow-auto">
          {children}
        </Content>

        {/* Footer */}

        <Footer
          className="text-center mx-3"
          style={{
            background: colorBgContainer,
            boxShadow: boxShadowSecondary,
            borderRadius: borderRadiusLG,
            padding: 0,
          }}
        >
          <div className="py-3 px-6 text-center shrink-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("layout.footerTitle", "Fixed Asset Management System")} © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t("layout.footerSubtitle", "Version 1.0.0")}
            </p>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
}
