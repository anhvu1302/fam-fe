"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeftOutlined, KeyOutlined, SafetyOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Spin } from "antd";

import authApi from "@/lib/api/auth";
import { useApiError } from "@/lib/hooks/use-api-error";

function RecoveryCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatError } = useApiError();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; type: "error" | "warning" | "info" } | null>(null);

  // Get session token from URL or sessionStorage
  const sessionToken = searchParams.get("token") || sessionStorage.getItem("2fa_session_token");

  const onSubmit = async (values: { recoveryCode: string }) => {
    if (!sessionToken) {
      setError({ message: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.", type: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyRecoveryCode({
        twoFactorSessionToken: sessionToken,
        recoveryCode: values.recoveryCode.replace(/\s/g, ""), // Remove spaces
      });

      if (!response.success) {
        const formattedError = formatError(response);
        setError(formattedError);
        message[formattedError.type](formattedError.message);
        return;
      }

      if (response.result.accessToken && response.result.refreshToken) {
        sessionStorage.removeItem("2fa_session_token");
        message.success("Đăng nhập thành công!");
        router.replace("/");
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError);
      message[formattedError.type](formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionToken) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <Alert
          message="Phiên không hợp lệ"
          description="Vui lòng đăng nhập lại để tiếp tục."
          type="error"
          showIcon
        />
        <div className="mt-4 text-center">
          <Link href="/login">
            <Button type="primary">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
          <KeyOutlined className="text-2xl text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Sử dụng mã khôi phục</h2>
        <p className="mt-1 text-sm text-gray-500">
          Nhập một trong các mã khôi phục bạn đã lưu khi thiết lập 2FA
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message={error.message}
          type={error.type}
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Info Alert */}
      <Alert
        message="Lưu ý"
        description="Mỗi mã khôi phục chỉ sử dụng được một lần. Sau khi đăng nhập, hãy tạo mã khôi phục mới."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Form */}
      <Form
        name="recovery-code"
        onFinish={onSubmit}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="recoveryCode"
          label="Mã khôi phục"
          rules={[
            { required: true, message: "Vui lòng nhập mã khôi phục!" },
            {
              pattern: /^[A-Za-z0-9\s-]+$/,
              message: "Mã khôi phục không hợp lệ!",
            },
          ]}
        >
          <Input
            prefix={<SafetyOutlined className="text-gray-400" />}
            placeholder="XXXX-XXXX-XXXX"
            className="font-mono text-center tracking-wider"
            autoFocus
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button type="primary" htmlType="submit" loading={loading} block className="h-11">
            Xác thực
          </Button>
        </Form.Item>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftOutlined className="text-xs" />
            Quay lại đăng nhập
          </Link>
        </div>
      </Form>
    </div>
  );
}

export default function RecoveryCodePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Đang tải...</p>
          </div>
        </div>
      }
    >
      <RecoveryCodeContent />
    </Suspense>
  );
}
