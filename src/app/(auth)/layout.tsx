import type { Metadata } from "next";

import { AuthLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "Đăng nhập - Fixed Asset Management",
  description: "Đăng nhập vào hệ thống quản lý tài sản cố định",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}