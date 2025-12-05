"use client";

import { Breadcrumb, Typography } from "antd";

const { Title, Text } = Typography;

export default function AdminHomePage() {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ title: "Trang chủ" }, { title: "Dashboard" }]}
        className="mb-4"
      />

      {/* Page Title */}
      <div className="mb-6">
        <Title level={2} className="mb-1!">
          Dashboard
        </Title>
        <Text type="secondary">
          Chào mừng bạn đến với hệ thống quản lý tài sản cố định
        </Text>
      </div>

      {/* Content placeholder */}
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <Text type="secondary" className="text-lg">
          Nội dung Dashboard sẽ được thêm sau...
        </Text>
      </div>
    </div>
  );
}
