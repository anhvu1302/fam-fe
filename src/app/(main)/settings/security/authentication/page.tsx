"use client";

import { useEffect, useRef, useState } from "react";
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
import QRCode from "qrcode";

import authApi, { type Enable2FAResult } from "@/lib/api/auth";
import { useI18n } from "@/lib/contexts/i18n-context";
import { useUser } from "@/lib/contexts/user-context";
import { useApiError } from "@/lib/hooks/use-api-error";

const { Text } = Typography;

export default function TwoFactorSetupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [messageApi, messageContextHolder] = message.useMessage();
  const { user, updateUser } = useUser();
  const { formatError } = useApiError();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<Enable2FAResult | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  useEffect(() => {
    // If 2FA already enabled, redirect
    if (user?.isTwoFactorEnabled) {
      router.push("/settings/security");
    }
  }, [router, user]);

  // Generate QR code when setupData changes
  useEffect(() => {
    if (setupData?.qrCodeUri && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, setupData.qrCodeUri, {
        width: 220,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).catch((err) => {
        console.error("Failed to generate QR code:", err);
      });
    }
  }, [setupData]);

  // Step 1: Enter password to enable 2FA
  const onPasswordSubmit = async (values: { password: string }) => {
    setLoading(true);

    try {
      const response = await authApi.enable2FA({ password: values.password });

      if (!response.success) {
        const formattedError = formatError(response);
        messageApi[formattedError.type](formattedError.message);
        return;
      }

      setSetupData(response.result);
      setCurrentStep(1);
    } catch (err) {
      const formattedError = formatError(err);
      messageApi[formattedError.type](formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify TOTP code
  const onCodeSubmit = async (values: { code: string }) => {
    setLoading(true);

    try {
      if (!setupData?.secret) {
        throw new Error(t("common.error", "Secret not found. Please try again."));
      }

      const response = await authApi.confirm2FA({
        code: values.code,
        secret: setupData.secret
      });

      if (!response.success) {
        const formattedError = formatError(response);
        messageApi[formattedError.type](formattedError.message);
        return;
      }

      const codes = response.result.backupCodes;

      if (codes && codes.length > 0) {
        setBackupCodes(codes);
        setCurrentStep(2);
        messageApi.success(t("settings.twoFactorEnabled", "Two-factor authentication enabled!"));
      } else {
        throw new Error(t("common.error", "Failed to receive backup codes. Please try again."));
      }
    } catch (err) {
      const formattedError = formatError(err);
      messageApi[formattedError.type](formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy secret to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    messageApi.success(t("common.copied", "Copied {text}!").replace("{text}", label));
  };

  // Copy all backup codes
  const copyBackupCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join("\n"));
      setBackupCodesSaved(true);
      messageApi.success(t("common.copied", "Mã đã được sao chép!"));
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
      setBackupCodesSaved(true);
      messageApi.success(t("common.downloaded", "Mã đã được tải xuống!"));
    }
  };

  const steps = [
    {
      title: t("auth.verify", "Xác nhận"),
    },
    {
      title: t("auth.setup", "Thiết lập"),
    },
    {
      title: t("auth.complete", "Hoàn tất"),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl p-6">
      {messageContextHolder}
      <Card>
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
            <SafetyOutlined className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("auth.setupTwoFactor", "Thiết lập xác thực hai lớp (2FA)")}
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {t("auth.setupTwoFactorDesc", "Tăng cường bảo mật cho tài khoản của bạn")}
          </p>
        </div>

        {/* Steps */}
        <Steps current={currentStep} items={steps} className="mb-12!" />

        {/* Step 0: Enter Password */}
        {currentStep === 0 && (
          <div>
            <Alert
              title={<span className="font-semibold">{t("auth.twoFactorAuth", "Xác thực hai lớp (2FA)")}</span>}
              description={t("auth.twoFactorDescription", "2FA thêm một lớp bảo mật bổ sung cho tài khoản của bạn. Ngoài mật khẩu, bạn sẽ cần nhập mã từ ứng dụng xác thực khi đăng nhập.")}
              type="info"
              showIcon
              className="mb-8! rounded-xl border-blue-200 bg-blue-50"
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
                label={<span className="text-gray-900 dark:text-gray-100 font-semibold text-base">{t("auth.enterPasswordToContinue", "Nhập mật khẩu để tiếp tục")}</span>}
                rules={[{ required: true, message: t("validation.passwordRequired", "Vui lòng nhập mật khẩu!") }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400 dark:text-gray-500" />}
                  placeholder={t("auth.enterCurrentPassword", "Nhập mật khẩu hiện tại")}
                  className="h-12"
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full justify-end">
                  <Button onClick={() => router.back()}>
                    {t("common.cancel", "Hủy")}
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {t("common.next", "Tiếp tục")}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* Step 1: Scan QR Code */}
        {currentStep === 1 && setupData && (
          <div>
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.scanQRWithApp", "Quét mã QR bằng ứng dụng xác thực")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("auth.useAuthApp", "Sử dụng ứng dụng như Google Authenticator, Authy, hoặc 1Password")}
              </p>
            </div>

            {/* QR Code */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 shadow-xl">
                {setupData.qrCodeUri ? (
                  <canvas
                    ref={qrCanvasRef}
                    className="block"
                    style={{ width: 220, height: 220 }}
                  />
                ) : (
                  <div className="flex h-55 w-55 items-center justify-center">
                    <QrcodeOutlined className="text-6xl text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Key */}
            <Divider className="my-8">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{t("auth.orManualEntry", "Hoặc nhập thủ công")}</span>
            </Divider>

            <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
              <Text className="mb-3 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.manualEntryKey", "Mã bí mật (Secret Key)")}
              </Text>
              <div className="flex items-center gap-3">
                <div className="flex-1 break-all rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
                  <code className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {setupData.manualEntryKey || setupData.secret}
                  </code>
                </div>
                <Button
                  type="default"
                  size="large"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    copyToClipboard(
                      setupData.manualEntryKey || setupData.secret || "",
                      t("auth.secretKey", "mã bí mật")
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
                label={<span className="text-gray-900 dark:text-gray-100 font-semibold text-base">{t("auth.enterSixDigitCode", "Nhập mã 6 chữ số từ ứng dụng")}</span>}
                rules={[
                  { required: true, message: t("validation.authCodeRequired", "Vui lòng nhập mã xác thực!") },
                  { pattern: /^\d{6}$/, message: t("validation.authCodeSixDigits", "Mã phải là 6 chữ số!") },
                ]}
              >
                <Input
                  prefix={<MobileOutlined className="text-gray-400 dark:text-gray-500" />}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl font-mono font-bold"
                  style={{ letterSpacing: '0.5em', paddingLeft: '3em', height: '60px' }}
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full justify-end">
                  <Button onClick={() => setCurrentStep(0)}>
                    {t("common.back", "Quay lại")}
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {t("common.confirm", "Xác nhận")}
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
              title={t("auth.twoFactorEnabledSuccess", "Đã bật xác thực hai lớp!")}
              subTitle={t("auth.saveBackupCodesBelow", "Hãy lưu các mã khôi phục bên dưới. Bạn sẽ cần chúng nếu mất quyền truy cập vào ứng dụng xác thực.")}
            />

            <Alert
              title={<span className="font-semibold">{t("common.important", "Quan trọng!")}</span>}
              description={t("auth.backupCodesWarning", "Mỗi mã khôi phục chỉ sử dụng được một lần. Hãy lưu chúng ở nơi an toàn và không chia sẻ với ai.")}
              type="warning"
              showIcon
              className="mb-8! rounded-xl border-amber-300 bg-amber-50"
            />

            {/* Backup Codes Grid */}
            <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-center font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <Button icon={<CopyOutlined />} onClick={copyBackupCodes}>
                {t("common.copyAll", "Sao chép tất cả")}
              </Button>
              <Button onClick={downloadBackupCodes}>
                {t("common.downloadTxt", "Tải xuống (.txt)")}
              </Button>
            </div>

            <Divider />

            <div className="text-center">
              {!backupCodesSaved && (
                <Alert
                  title={t("auth.saveCodesFirst", "Vui lòng sao chép hoặc tải xuống các mã khôi phục trước khi tiếp tục")}
                  type="warning"
                  showIcon
                  className="mb-4! rounded-lg"
                />
              )}
              <Button
                type="primary"
                size="large"
                disabled={!backupCodesSaved}
                onClick={() => {
                  updateUser({ isTwoFactorEnabled: true });
                  router.push("/settings/security");
                }}
              >
                {t("common.done", "Hoàn tất")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
