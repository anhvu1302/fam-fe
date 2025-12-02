"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input, message } from "antd";

import authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthStep, LoginRequest } from "@/types/auth";

interface LoginFormValues {
  identity: string;
  password: string;
  remember: boolean;
}

interface TwoFactorFormValues {
  code: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [twoFactorSessionToken, setTwoFactorSessionToken] = useState<
    string | null
  >(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await tokenStorage.verifyAuthentication();
      if (isAuth) {
        router.replace("/");
      } else {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);  // Show loading while checking
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Đang kiểm tra...</div>
        </div>
      </div>
    );
  }

  // Handle login with credentials
  const onLoginSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = {
        identity: values.identity,
        password: values.password,
        rememberMe: values.remember,
      };

      const response = await authApi.login(loginData);

      // Check if 2FA is required
      if (response.requiresTwoFactor && response.twoFactorSessionToken) {
        setTwoFactorSessionToken(response.twoFactorSessionToken);
        setRememberMe(values.remember);
        setStep("2fa");
        message.info("Vui lòng nhập mã xác thực 2FA");
      } else if (response.accessToken) {
        // Login successful without 2FA - tokens already saved in authApi
        message.success("Đăng nhập thành công!");
        router.replace("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Đăng nhập thất bại";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const onTwoFactorSubmit = async (values: TwoFactorFormValues) => {
    if (!twoFactorSessionToken) {
      setError("Phiên đăng nhập không hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verify2FA({
        twoFactorCode: values.code,
        twoFactorSessionToken,
        rememberMe,
      });

      if (response.accessToken) {
        // Tokens already saved in authApi
        message.success("Đăng nhập thành công!");
        router.replace("/");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Mã xác thực không đúng";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Back to credentials step
  const handleBackToLogin = () => {
    setStep("credentials");
    setTwoFactorSessionToken(null);
    setError(null);
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        {/* Mobile logo */}
        <h1 className="mb-2 text-2xl font-bold text-gray-800 lg:hidden">
          Fixed Asset Mgmt
        </h1>

        {step === "credentials" ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800">Đăng nhập</h2>
            <p className="mt-1 text-sm text-gray-500">
              Nhập thông tin để truy cập hệ thống
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <SafetyOutlined className="text-2xl text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Xác thực hai lớp
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
            </p>
          </>
        )}
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

      {/* Credentials Form */}
      {step === "credentials" && (
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onLoginSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          {/* Username/Email */}
          <Form.Item
            name="identity"
            label="Tên đăng nhập hoặc Email"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
              { max: 255, message: "Tên đăng nhập tối đa 255 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập tên đăng nhập hoặc email"
              autoComplete="username"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              { max: 100, message: "Mật khẩu tối đa 100 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          {/* Remember */}
          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          {/* Submit button */}
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* 2FA Form */}
      {step === "2fa" && (
        <Form
          name="two-factor"
          onFinish={onTwoFactorSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          {/* OTP Code */}
          <Form.Item
            name="code"
            label="Mã xác thực"
            rules={[
              { required: true, message: "Vui lòng nhập mã xác thực!" },
              { len: 6, message: "Mã xác thực phải có 6 chữ số!" },
              {
                pattern: /^\d{6}$/,
                message: "Mã xác thực chỉ chứa chữ số!",
              },
            ]}
          >
            <Input
              prefix={<SafetyOutlined className="text-gray-400" />}
              placeholder="Nhập mã 6 chữ số"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </Form.Item>

          {/* Submit button */}
          <Form.Item className="mb-4">
            <Button type="primary" htmlType="submit" loading={loading} block>
              Xác thực
            </Button>
          </Form.Item>

          {/* Back button */}
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToLogin}
            className="w-full"
          >
            Quay lại đăng nhập
          </Button>

          {/* Backup code hint */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Không thể truy cập ứng dụng xác thực?
            <br />
            Liên hệ quản trị viên để được hỗ trợ
          </p>
        </Form>
      )}
    </div>
  );
}
