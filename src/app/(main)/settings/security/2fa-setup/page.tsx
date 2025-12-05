"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CopyOutlined,
  LockOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Result,
  Space,
  Steps,
  Typography,
} from "antd";

import authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import type { Enable2FAResponse, UserInfo } from "@/types/auth";

const { Text } = Typography;

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<Enable2FAResponse | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = tokenStorage.getUser() as UserInfo | null;

    // If 2FA already enabled, redirect
    if (userData?.isTwoFactorEnabled) {
      router.push("/settings/security");
    }
  }, [router]);

  // Step 1: Enter password to enable 2FA
  const onPasswordSubmit = async (values: { password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.enable2FA({ password: values.password });
      setSetupData(response);
      setCurrentStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể bật 2FA. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify TOTP code
  const onCodeSubmit = async (values: { code: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.confirm2FA({ code: values.code });
      if (response.success && response.backupCodes) {
        setBackupCodes(response.backupCodes);
        setCurrentStep(2);
        message.success("Đã bật xác thực hai lớp thành công!");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Mã xác thực không đúng. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Copy secret to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}!`);
  };

  // Copy all backup codes
  const copyBackupCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join("\n"));
      message.success("Đã sao chép tất cả mã khôi phục!");
    }
  };

  // Download backup codes as file
  const downloadBackupCodes = () => {
    if (backupCodes) {
      const content = `Fixed Asset Management - Mã khôi phục 2FA\n${"=".repeat(50)}\n\nCác mã sau đây chỉ sử dụng được một lần.\nHãy giữ chúng ở nơi an toàn.\n\n${backupCodes.join("\n")}\n\nNgày tạo: ${new Date().toLocaleString("vi-VN")}`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fam-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const steps = [
    {
      title: "Xác nhận",
      subTitle: "Nhập mật khẩu",
    },
    {
      title: "Thiết lập",
      subTitle: "Quét mã QR",
    },
    {
      title: "Hoàn tất",
      subTitle: "Lưu mã khôi phục",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <SafetyOutlined className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Thiết lập xác thực hai lớp (2FA)
          </h1>
          <p className="mt-2 text-gray-500">
            Tăng cường bảo mật cho tài khoản của bạn
          </p>
        </div>

        {/* Steps */}
        <Steps current={currentStep} items={steps} className="mb-8" />

        {/* Error Alert */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Step 0: Enter Password */}
        {currentStep === 0 && (
          <div>
            <Alert
              message="Xác thực hai lớp (2FA)"
              description="2FA thêm một lớp bảo mật bổ sung cho tài khoản của bạn. Ngoài mật khẩu, bạn sẽ cần nhập mã từ ứng dụng xác thực khi đăng nhập."
              type="info"
              showIcon
              className="mb-6"
            />

            <Form
              name="enable-2fa-password"
              onFinish={onPasswordSubmit}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                label="Nhập mật khẩu để tiếp tục"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full justify-end">
                  <Button onClick={() => router.back()}>Hủy</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Tiếp tục
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* Step 1: Scan QR Code */}
        {currentStep === 1 && setupData && (
          <div>
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-lg font-medium">
                Quét mã QR bằng ứng dụng xác thực
              </h3>
              <p className="text-gray-500">
                Sử dụng ứng dụng như Google Authenticator, Authy, hoặc 1Password
              </p>
            </div>

            {/* QR Code */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                {setupData.qrCodeUri ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={setupData.qrCodeUri}
                    alt="QR Code"
                    className="h-48 w-48"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center">
                    <QrcodeOutlined className="text-6xl text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Key */}
            <Divider>Hoặc nhập thủ công</Divider>

            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <Text type="secondary" className="mb-2 block text-sm">
                Mã bí mật (Secret Key):
              </Text>
              <div className="flex items-center gap-2">
                <Text code className="flex-1 break-all text-sm">
                  {setupData.manualEntryKey || setupData.secret}
                </Text>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() =>
                    copyToClipboard(
                      setupData.manualEntryKey || setupData.secret || "",
                      "mã bí mật"
                    )
                  }
                />
              </div>
            </div>

            {/* Verify Code Form */}
            <Form
              name="verify-2fa-code"
              onFinish={onCodeSubmit}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="code"
                label="Nhập mã 6 chữ số từ ứng dụng"
                rules={[
                  { required: true, message: "Vui lòng nhập mã xác thực!" },
                  { pattern: /^\d{6}$/, message: "Mã phải là 6 chữ số!" },
                ]}
              >
                <Input
                  prefix={<MobileOutlined className="text-gray-400" />}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full justify-end">
                  <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Xác nhận
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* Step 2: Backup Codes */}
        {currentStep === 2 && backupCodes && (
          <div>
            <Result
              status="success"
              title="Đã bật xác thực hai lớp!"
              subTitle="Hãy lưu các mã khôi phục bên dưới. Bạn sẽ cần chúng nếu mất quyền truy cập vào ứng dụng xác thực."
            />

            <Alert
              message="Quan trọng!"
              description="Mỗi mã khôi phục chỉ sử dụng được một lần. Hãy lưu chúng ở nơi an toàn và không chia sẻ với ai."
              type="warning"
              showIcon
              className="mb-6"
            />

            {/* Backup Codes Grid */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded border border-gray-200 bg-white p-2 text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <Button icon={<CopyOutlined />} onClick={copyBackupCodes}>
                Sao chép tất cả
              </Button>
              <Button onClick={downloadBackupCodes}>Tải xuống (.txt)</Button>
            </div>

            <Divider />

            <div className="text-center">
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/settings/security")}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
