"use client";

import { Breadcrumb, Typography } from "antd";

import { useI18n } from "@/lib/i18n-context";

const { Title, Text } = Typography;

export default function AdminHomePage() {
  const { t } = useI18n();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ title: t("layout.home", "Trang chủ") }, { title: t("layout.nav.dashboard", "Dashboard") }]}
        className="mb-4"
      />

      {/* Page Title */}
      <div className="mb-6">
        <Title level={2} className="mb-1!">
          {t("dashboard.title", "Dashboard")}
        </Title>
        <Text type="secondary">
          {t("dashboard.welcome", "Chào mừng bạn đến với hệ thống quản lý tài sản cố định")}
        </Text>
      </div>

      {/* Content placeholder */}
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <Text type="secondary" className="text-lg">
          {t("dashboard.placeholder", "Nội dung Dashboard sẽ được thêm sau...")}
        </Text>
      </div>
    </div>
  );
}
