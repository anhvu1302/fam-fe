"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Result, Spin } from "antd";

import authApi from "@/lib/api/auth";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!email || !token) {
        setError("Link khôi phục mật khẩu không hợp lệ.");
        setVerifying(false);
        return;
      }

      try {
        await authApi.verifyResetToken({ email, resetToken: token });
        setTokenValid(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Link khôi phục mật khẩu đã hết hạn hoặc không hợp lệ.";
        setError(errorMessage);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [email, token]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({
        email,
        resetToken: token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setSuccess(true);
      message.success("Đặt lại mật khẩu thành công!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while verifying
  if (verifying) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang xác minh link...</p>
        </div>
      </div>
    );
  }

  // Show error if token invalid
  if (!tokenValid && !success) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <Result
          status="error"
          title="Link không hợp lệ"
          subTitle={error || "Link khôi phục mật khẩu đã hết hạn hoặc không hợp lệ."}
          extra={[
            <Link href="/forgot-password" key="forgot">
              <Button type="primary" size="large" className="m-2">
                Yêu cầu link mới
              </Button>
            </Link>,
            <Link href="/login" key="login">
              <Button size="large" className="m-2">Quay lại đăng nhập</Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  // Show success
  if (success) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <Result
          icon={<CheckCircleOutlined className="text-green-500" />}
          status="success"
          title="Đặt lại mật khẩu thành công!"
          subTitle="Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới."
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/login")}
            >
              Đăng nhập ngay
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <LockOutlined className="text-2xl text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Đặt mật khẩu mới
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Form */}
      <Form
        name="reset-password"
        onFinish={onSubmit}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            { max: 100, message: "Mật khẩu tối đa 100 ký tự!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Mật khẩu phải có chữ hoa, chữ thường và số!",
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-11"
          >
            Đặt lại mật khẩu
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

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
