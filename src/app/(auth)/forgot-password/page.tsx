"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Result } from "antd";

import authApi from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n-context";

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword({ email: values.email });

      setSubmittedEmail(values.email);
      setSubmitted(true);
      messageApi.success("Đã gửi email khôi phục mật khẩu!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể gửi email khôi phục. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        {messageContextHolder}
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <Result
            status="success"
            title="Đã gửi email khôi phục!"
            subTitle={
              <div className="text-gray-600">
                <p>
                  Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến{" "}
                  <strong>{submittedEmail}</strong>
                </p>
                <p className="mt-2">
                  Vui lòng kiểm tra hộp thư đến (và thư mục spam) của bạn.
                </p>
              </div>
            }
            extra={[
              <Link href="/login" key="login">
                <Button type="primary" size="large">
                  Quay lại đăng nhập
                </Button>
              </Link>,
              <Button
                key="resend"
                size="large"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedEmail("");
                }}
              >
                Gửi lại email
              </Button>,
            ]}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {messageContextHolder}
      <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <MailOutlined className="text-2xl text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Quên mật khẩu?</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        {/* Form */}
        <Form
          name="forgot-password"
          onFinish={onSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="example@company.com"
              autoComplete="email"
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
              Gửi email khôi phục
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeftOutlined className="text-xs" />
              Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
}
