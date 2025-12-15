"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  type FormInstance,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";

import authApi from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n-context";
import { tokenStorage } from "@/lib/token-storage";
import { useUser } from "@/lib/user-context";


const { Title, Text, Paragraph } = Typography;

export default function SecuritySettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [messageApi, messageContextHolder] = message.useMessage();
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const disable2FAFormRef = useRef<FormInstance>(null);
  const changePasswordFormRef = useRef<FormInstance>(null);

  const handleDisable2FA = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authApi.disable2FA({ password: values.password });

      messageApi.success(t("settings.disable2FASuccess", "Đã tắt xác thực hai lớp!"));
      disable2FAFormRef.current?.resetFields();
      setShowDisable2FAModal(false);
      // Update user state in context (memory only - no localStorage)
      updateUser({ twoFactorEnabled: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("settings.disable2FAError", "Không thể tắt 2FA. Vui lòng thử lại.");
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    logoutAllDevices: boolean;
  }) => {
    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        logoutAllDevices: values.logoutAllDevices,
      });

      messageApi.success(t("settings.changePasswordSuccess", "Đã đổi mật khẩu thành công!"));
      changePasswordFormRef.current?.resetFields();
      setShowChangePasswordModal(false);

      if (values.logoutAllDevices) {
        messageApi.info(t("common.loggingOut", "Đang đăng xuất..."));
        tokenStorage.clear();
        router.push("/login");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("settings.changePasswordError", "Không thể đổi mật khẩu. Vui lòng thử lại.");
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {messageContextHolder}
      <div className="mb-6">
        <Title level={2}>
          <SafetyOutlined className="mr-2" />
          {t("settings.security", "Bảo mật")}
        </Title>
        <Text type="secondary">
          {t("settings.manageSecuritySettings", "Quản lý các cài đặt bảo mật cho tài khoản của bạn")}
        </Text>
      </div>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MobileOutlined className="text-xl text-blue-600" />
            </div>
            <div>
              <Title level={4} className="mb-1!">
                {t("settings.twoFactorAuth", "Xác thực hai lớp (2FA)")}
              </Title>
              <Paragraph type="secondary" className="mb-2!">
                {t("settings.twoFactorDescription", "Thêm một lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu cầu mã xác thực khi đăng nhập.")}
              </Paragraph>
              {user?.twoFactorEnabled ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {t("settings.twoFactorEnabled", "Đã bật")}
                </Tag>
              ) : (
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  {t("settings.twoFactorDisabled", "Chưa bật")}
                </Tag>
              )}
            </div>
          </div>
          <div>
            {user?.twoFactorEnabled ? (
              <Button danger onClick={() => setShowDisable2FAModal(true)}>
                {t("settings.disable2FA", "Tắt 2FA")}
              </Button>
            ) : (
              <Button type="primary" onClick={() => router.push("/settings/security/authentication")}>
                {t("settings.enable2FA", "Bật 2FA")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <LockOutlined className="text-xl text-green-600" />
            </div>
            <div>
              <Title level={4} className="mb-1!">
                {t("settings.password", "Mật khẩu")}
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                {t("settings.passwordDescription", "Đổi mật khẩu định kỳ để tăng cường bảo mật tài khoản.")}
              </Paragraph>
            </div>
          </div>
          <Button onClick={() => setShowChangePasswordModal(true)}>
            {t("settings.changePassword", "Đổi mật khẩu")}
          </Button>
        </div>
      </Card>

      {/* Devices & Sessions */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <KeyOutlined className="text-xl text-purple-600" />
            </div>
            <div>
              <Title level={4} className="mb-1!">
                {t("settings.devicesAndSessions", "Thiết bị & Phiên đăng nhập")}
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                {t("settings.devicesDescription", "Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn.")}
              </Paragraph>
            </div>
          </div>
          <Button onClick={() => router.push("/settings/security/sessions")}>
            {t("settings.manageDevices", "Quản lý thiết bị")}
          </Button>
        </div>
      </Card>

      {/* Disable 2FA Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined className="mr-2 text-orange-500" />
            {t("settings.disableTwoFactorTitle", "Tắt xác thực hai lớp")}
          </span>
        }
        open={showDisable2FAModal}
        onCancel={() => setShowDisable2FAModal(false)}
        footer={null}
      >
        <Alert
          title={t("common.warning", "Cảnh báo")}
          description={t("settings.disableTwoFactorWarning", "Tắt 2FA sẽ làm giảm bảo mật của tài khoản. Bạn có chắc chắn muốn tiếp tục?")}
          type="warning"
          showIcon
          className="mb-4!"
        />
        <Form
          ref={disable2FAFormRef}
          name="disable-2fa"
          onFinish={handleDisable2FA}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label={t("settings.enterPasswordToConfirm", "Nhập mật khẩu để xác nhận")}
            rules={[{ required: true, message: t("validation.passwordRequired", "Vui lòng nhập mật khẩu!") }]}
          >
            <Input.Password placeholder={t("settings.currentPassword", "Mật khẩu hiện tại")} />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                disable2FAFormRef.current?.resetFields();
                setShowDisable2FAModal(false);
              }}>{t("common.cancel", "Hủy")}</Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                {t("settings.disable2FA", "Tắt 2FA")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <span>
            <LockOutlined className="mr-2" />
            {t("settings.changePassword", "Đổi mật khẩu")}
          </span>
        }
        open={showChangePasswordModal}
        onCancel={() => setShowChangePasswordModal(false)}
        footer={null}
        width={480}
      >
        <Form
          ref={changePasswordFormRef}
          name="change-password"
          onFinish={handleChangePassword}
          layout="vertical"
          requiredMark={false}
          initialValues={{ logoutAllDevices: false }}
        >
          <Form.Item
            name="currentPassword"
            label={t("settings.currentPassword", "Mật khẩu hiện tại")}
            rules={[{ required: true, message: t("validation.currentPasswordRequired", "Vui lòng nhập mật khẩu hiện tại!") }]}
          >
            <Input.Password placeholder={t("settings.enterCurrentPassword", "Nhập mật khẩu hiện tại")} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={t("settings.newPassword", "Mật khẩu mới")}
            rules={[
              { required: true, message: t("validation.newPasswordRequired", "Vui lòng nhập mật khẩu mới!") },
              { min: 8, message: t("validation.passwordMinLength", "Mật khẩu phải có ít nhất 8 ký tự!") },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: t("validation.passwordPattern", "Mật khẩu phải có chữ hoa, chữ thường và số!"),
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder={t("settings.enterNewPassword", "Nhập mật khẩu mới")} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("settings.confirmPassword", "Xác nhận mật khẩu mới")}
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: t("validation.confirmPasswordRequired", "Vui lòng xác nhận mật khẩu!") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("validation.passwordMismatch", "Mật khẩu xác nhận không khớp!")));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t("settings.confirmNewPassword", "Nhập lại mật khẩu mới")} />
          </Form.Item>

          <Form.Item name="logoutAllDevices" valuePropName="checked">
            <Space>
              <Switch />
              <span>{t("settings.logoutAllDevices", "Đăng xuất tất cả thiết bị khác sau khi đổi mật khẩu")}</span>
            </Space>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                changePasswordFormRef.current?.resetFields();
                setShowChangePasswordModal(false);
              }}>{t("common.cancel", "Hủy")}</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("settings.changePassword", "Đổi mật khẩu")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
