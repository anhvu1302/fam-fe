"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input, message, Statistic } from "antd";

import authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/axios-client";
import { useI18n } from "@/lib/i18n-context";
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

interface EmailOtpFormValues {
  otp: string;
}

interface ErrorState {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  type?: "error" | "warning" | "info";
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [twoFactorSessionToken, setTwoFactorSessionToken] = useState<
    string | null
  >(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

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
  }, [router]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutCountdown || lockoutCountdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setLockoutCountdown((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutCountdown]);
  // Show loading while checking
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  // Parse API error response
  const parseApiError = (err: unknown): ErrorState => {
    if (err instanceof ApiError) {
      // Get error code from data.errors[0].code or default to code
      let errorCode = err.code;
      let errorDetails: Record<string, unknown> | undefined;

      if (
        err.data &&
        typeof err.data === "object" &&
        "errors" in err.data &&
        Array.isArray(err.data.errors) &&
        err.data.errors.length > 0
      ) {
        const firstError = err.data.errors[0];
        if (typeof firstError === "object" && "code" in firstError) {
          errorCode = firstError.code as string;
        }
        if (typeof firstError === "object" && "details" in firstError) {
          errorDetails = firstError.details as Record<string, unknown>;
        }
      }

      // Map error codes to messages
      const errorCodeMap: Record<string, [string, "error" | "warning" | "info"]> = {
        AUTH_EMAIL_NOT_VERIFIED: [
          t("errors.AUTH_EMAIL_NOT_VERIFIED"),
          "warning",
        ],
        AUTH_INVALID_CREDENTIALS: [
          t("errors.AUTH_INVALID_CREDENTIALS"),
          "error",
        ],
        AUTH_INVALID_2FA_CODE: [
          t("errors.AUTH_INVALID_2FA_CODE"),
          "error",
        ],
        AUTH_ACCOUNT_LOCKED: [
          `${t("errors.AUTH_ACCOUNT_LOCKED")} (${errorDetails?.minutesRemaining || 15} ${t("common.minutesRemaining") || "phút"})`,
          "warning",
        ],
        AUTH_ACCOUNT_INACTIVE: [
          t("errors.AUTH_ACCOUNT_INACTIVE"),
          "warning",
        ],
      };

      const [message, type] =
        errorCodeMap[errorCode] || [err.message, "error"];

      return {
        message,
        code: errorCode,
        details: errorDetails,
        type,
      };
    }

    return {
      message: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
      type: "error",
    };
  };

  // Handle login with credentials
  const onLoginSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    setLockoutCountdown(null);

    try {
      const loginData: LoginRequest = {
        identity: values.identity,
        password: values.password,
        rememberMe: values.remember,
      };

      const response = await authApi.login(loginData);

      // Check if email needs verification
      if (response.requiresEmailVerification) {
        setUserEmail(values.identity);
        setRememberMe(values.remember);
        setStep("email-otp");
      }
      // Check if 2FA is required
      else if (response.requiresTwoFactor && response.twoFactorSessionToken) {
        setTwoFactorSessionToken(response.twoFactorSessionToken);
        setRememberMe(values.remember);
        setStep("2fa");
        // Store session token for recovery page
        sessionStorage.setItem(
          "2fa_session_token",
          response.twoFactorSessionToken
        );
        messageApi.info(t("auth.twoFactorAuth"));
      } else if (response.accessToken) {
        // Login successful without 2FA - tokens already saved in authApi
        messageApi.success(t("common.success"));
        router.replace("/");
      }
    } catch (err) {
      const errorState = parseApiError(err);

      // Handle account locked with countdown
      if (errorState.code === "AUTH_ACCOUNT_LOCKED") {
        const minutesRemaining = (errorState.details?.minutesRemaining as number) || 15;
        setLockoutCountdown(minutesRemaining * 60); // Convert to seconds
        setError({
          ...errorState,
          message: `${t("errors.AUTH_ACCOUNT_LOCKED")} (${minutesRemaining} ${t("common.minutesRemaining") || "phút"})`,
        });
      } else {
        setError(errorState);
      }

      messageApi.error(errorState.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const onTwoFactorSubmit = async (values: TwoFactorFormValues) => {
    if (!twoFactorSessionToken) {
      const errorMsg = t("errors.AUTH_INVALID_TOKEN");
      setError({ message: errorMsg, type: "error" });
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
        messageApi.success(t("common.success"));
        router.replace("/");
      }
    } catch (err) {
      const errorState = parseApiError(err);
      setError(errorState);
      messageApi.error(errorState.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle email OTP verification
  const onEmailOtpSubmit = async (values: EmailOtpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyEmailOtp({
        email: userEmail,
        emailOtp: values.otp,
      });

      if (response.accessToken) {
        // Tokens already saved in authApi
        messageApi.success(t("common.success"));
        router.replace("/");
      } else if (response.requiresTwoFactor && response.twoFactorSessionToken) {
        // After email verification, 2FA is required
        setTwoFactorSessionToken(response.twoFactorSessionToken);
        setStep("2fa");
        sessionStorage.setItem(
          "2fa_session_token",
          response.twoFactorSessionToken
        );
        messageApi.info(t("auth.twoFactorAuth"));
      }
    } catch (err) {
      const errorState = parseApiError(err);
      setError(errorState);
      message.error(errorState.message);
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
    <>
      {messageContextHolder}
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Mobile logo */}
          <h1 className="mb-2 text-2xl font-bold text-gray-800 lg:hidden">
            Fixed Asset Mgmt
          </h1>

          {step === "credentials" ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800">{t("auth.login")}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("auth.enterEmail")}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <SafetyOutlined className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {t("auth.twoFactorAuth")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("auth.enterAuthCode")}
              </p>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message={error.message}
            type={error.type || "error"}
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        {/* Account Locked Countdown */}
        {error?.code === "AUTH_ACCOUNT_LOCKED" && lockoutCountdown !== null && lockoutCountdown > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <p className="mb-3 text-center text-sm font-medium text-gray-700">
              {t("common.tryAgainIn")}
            </p>
            <div className="text-center">
              <Statistic.Countdown
                value={Date.now() + lockoutCountdown * 1000}
                format="mm:ss"
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </div>
          </div>
        )}

        {/* Email Not Verified Message */}
        {error?.code === "AUTH_EMAIL_NOT_VERIFIED" && step !== "email-otp" && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-4">
            <p className="mb-3 text-sm text-gray-700">
              {t("auth.contactAdminToVerifyEmail")}
            </p>
            <button
              onClick={handleBackToLogin}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t("common.back")}
            </button>
          </div>
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
              label={t("auth.email")}
              rules={[
                { required: true, message: t("validation.required") },
                { min: 3, message: t("validation.minLength").replace("{min}", "3") },
                { max: 255, message: t("validation.maxLength").replace("{max}", "255") },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t("auth.enterEmail")}
                autoComplete="username"
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              label={t("auth.password")}
              rules={[
                { required: true, message: t("validation.required") },
                { min: 8, message: t("validation.minLength").replace("{min}", "8") },
                { max: 100, message: t("validation.maxLength").replace("{max}", "100") },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t("auth.enterPassword")}
                autoComplete="current-password"
              />
            </Form.Item>

            {/* Remember */}
            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{t("auth.rememberMe")}</Checkbox>
                </Form.Item>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>
            </Form.Item>

            {/* Submit button */}
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={
                  error?.code === "AUTH_ACCOUNT_LOCKED" && lockoutCountdown !== null && lockoutCountdown > 0
                }
                block
              >
                {t("auth.login")}
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
              label={t("auth.enterAuthCode")}
              rules={[
                { required: true, message: t("validation.required") },
                {
                  pattern: /^\d{6}$/,
                  message: t("validation.otpLength") || "Mã xác thực phải có 6 chữ số",
                },
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder={t("auth.enterAuthCode")}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item className="mb-4">
              <Button type="primary" htmlType="submit" loading={loading} block>
                {t("common.confirm")}
              </Button>
            </Form.Item>

            {/* Back button */}
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToLogin}
              className="w-full"
            >
              {t("common.back")}
            </Button>

            {/* Backup code hint */}
            <p className="mt-4 text-center text-xs text-gray-400">
              {t("auth.forgotPassword")}
              <br />
              <a
                href="/login/recovery"
                className="text-blue-600 hover:text-blue-700"
              >
                {t("auth.recoveryCode")}
              </a>
            </p>
          </Form>
        )}

        {/* Email OTP Form */}
        {step === "email-otp" && (
          <Form
            name="email-otp"
            onFinish={onEmailOtpSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <SafetyOutlined className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {t("auth.verifyEmail")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("auth.otpSentTo")} <strong>{userEmail}</strong>
              </p>
            </div>

            {/* OTP Code */}
            <Form.Item
              name="otp"
              label={t("auth.enterOtpCode")}
              rules={[
                { required: true, message: t("validation.required") },
                {
                  pattern: /^\d{6}$/,
                  message: t("validation.otpLength") || "Mã OTP phải có 6 chữ số",
                },
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder={t("auth.enterOtpCode")}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item className="mb-4">
              <Button type="primary" htmlType="submit" loading={loading} block>
                {t("common.confirm")}
              </Button>
            </Form.Item>

            {/* Back button */}
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToLogin}
              className="w-full"
            >
              {t("common.back")}
            </Button>
          </Form>
        )}
      </div>
    </>
  );
}
