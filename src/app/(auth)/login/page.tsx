"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";

import authApi, { type AuthStep, type LoginRequest } from "@/lib/api/auth";
import { ERROR_CODES } from "@/lib/constants/error-codes";
import { useI18n } from "@/lib/contexts/i18n-context";
import { useApiError } from "@/lib/hooks/use-api-error";
import { tokenStorage } from "@/lib/utils/token-storage";

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

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { formatError } = useApiError();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [twoFactorSessionToken, setTwoFactorSessionToken] = useState<
    string | null
  >(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; type: "error" | "warning" | "info"; details?: Record<string, unknown> } | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = tokenStorage.isAuthenticated();
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

      if (!response.success) {
        // Format error with automatic translation
        const formattedError = formatError(response);

        // Handle account locked with countdown
        if (formattedError.code === ERROR_CODES.AUTH_ACCOUNT_LOCKED) {
          // Try to extract minutes from error message
          const minutesMatch = formattedError.message.match(/(\d+)\s*(?:minutes|phút)/i);
          const minutesRemaining = minutesMatch ? parseInt(minutesMatch[1], 10) : 15;
          setLockoutCountdown(minutesRemaining * 60); // Convert to seconds
          setError({
            message: `${formattedError.message}`,
            code: formattedError.code,
            type: formattedError.type,
            details: formattedError.details,
          });
        } else {
          setError({
            message: formattedError.message,
            code: formattedError.code,
            type: formattedError.type,
            details: formattedError.details,
          });
        }

        messageApi[formattedError.type](formattedError.message);
        return;
      }

      const loginResult = response.result;

      // Check if email needs verification
      if (loginResult.requiresEmailVerification) {
        setUserEmail(values.identity);
        setRememberMe(values.remember);
        setStep("email-otp");
      }
      // Check if 2FA is required
      else if (loginResult.requiresTwoFactor && loginResult.twoFactorSessionToken) {
        setTwoFactorSessionToken(loginResult.twoFactorSessionToken);
        setRememberMe(values.remember);
        setStep("2fa");
        // Store session token for recovery page
        sessionStorage.setItem(
          "2fa_session_token",
          loginResult.twoFactorSessionToken
        );
        messageApi.info(t("auth.twoFactorAuth"));
      } else if (loginResult.accessToken && loginResult.refreshToken) {
        // Login successful - save tokens
        await tokenStorage.setTokens(
          loginResult.accessToken,
          loginResult.refreshToken,
          loginResult.accessTokenExpiresAt,
          loginResult.refreshTokenExpiresAt
        );
        if (loginResult.deviceId) {
          tokenStorage.setDeviceId(loginResult.deviceId);
        }
        messageApi.success(t("common.success"));
        router.replace("/");
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError({
        message: formattedError.message,
        code: formattedError.code,
        type: formattedError.type,
        details: formattedError.details,
      });
      messageApi[formattedError.type](formattedError.message);
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

      if (!response.success) {
        const formattedError = formatError(response);
        setError({
          message: formattedError.message,
          code: formattedError.code,
          type: formattedError.type,
        });
        messageApi[formattedError.type](formattedError.message);
        return;
      }

      const authData = response.result;
      if (authData.accessToken && authData.refreshToken) {
        // Save tokens
        await tokenStorage.setTokens(
          authData.accessToken,
          authData.refreshToken,
          authData.accessTokenExpiresAt,
          authData.refreshTokenExpiresAt
        );
        if (authData.deviceId) {
          tokenStorage.setDeviceId(authData.deviceId);
        }
        messageApi.success(t("common.success"));
        router.replace("/");
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError({
        message: formattedError.message,
        code: formattedError.code,
        type: formattedError.type,
        details: formattedError.details,
      });
      messageApi[formattedError.type](formattedError.message);
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

      if (!response.success) {
        const formattedError = formatError(response);
        setError({
          message: formattedError.message,
          code: formattedError.code,
          type: formattedError.type,
        });
        messageApi[formattedError.type](formattedError.message);
        return;
      }

      const authData = response.result;
      if (authData.accessToken && authData.refreshToken) {
        // Save tokens
        await tokenStorage.setTokens(
          authData.accessToken,
          authData.refreshToken,
          authData.accessTokenExpiresAt,
          authData.refreshTokenExpiresAt
        );
        if (authData.deviceId) {
          tokenStorage.setDeviceId(authData.deviceId);
        }
        messageApi.success(t("common.success"));
        router.replace("/");
      } else if (authData.requiresTwoFactor && authData.twoFactorSessionToken) {
        // After email verification, 2FA is required
        setTwoFactorSessionToken(authData.twoFactorSessionToken);
        setStep("2fa");
        sessionStorage.setItem(
          "2fa_session_token",
          authData.twoFactorSessionToken
        );
        messageApi.info(t("auth.twoFactorAuth"));
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError({
        message: formattedError.message,
        code: formattedError.code,
        type: formattedError.type,
        details: formattedError.details,
      });
      messageApi[formattedError.type](formattedError.message);
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
      <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: "var(--colorBgContainer)" }}>
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Mobile logo */}
          <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100 lg:hidden">
            Fixed Asset Mgmt
          </h1>

          {step === "credentials" ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t("auth.login")}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("auth.enterEmail")}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <SafetyOutlined className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("auth.twoFactorAuth")}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("auth.enterAuthCode")}
              </p>
            </>
          )}
        </div>

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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {t("auth.verifyEmail")}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
