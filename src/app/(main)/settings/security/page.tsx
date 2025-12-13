"use client";

import { useState } from "react";
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
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";

import authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import { useUser } from "@/lib/user-context";


const { Title, Text, Paragraph } = Typography;

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // User is already managed by UserContext
  // No need to initialize from tokenStorage
  const handleDisable2FA = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authApi.disable2FA({ password: values.password });

      message.success("Đã tắt xác thực hai lớp!");
      setShowDisable2FAModal(false);
      // Update user state in context (memory only - no localStorage)
      updateUser({ isTwoFactorEnabled: false, twoFactorEnabled: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tắt 2FA. Vui lòng thử lại.";
      message.error(errorMessage);
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

      message.success("Đã đổi mật khẩu thành công!");
      setShowChangePasswordModal(false);

      if (values.logoutAllDevices) {
        message.info("Đang đăng xuất...");
        tokenStorage.clear();
        router.push("/login");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể đổi mật khẩu. Vui lòng thử lại.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Title level={2}>
          <SafetyOutlined className="mr-2" />
          Bảo mật
        </Title>
        <Text type="secondary">
          Quản lý các cài đặt bảo mật cho tài khoản của bạn
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
                Xác thực hai lớp (2FA)
              </Title>
              <Paragraph type="secondary" className="mb-2!">
                Thêm một lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu cầu mã xác
                thực khi đăng nhập.
              </Paragraph>
              {user?.isTwoFactorEnabled ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Đã bật
                </Tag>
              ) : (
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  Chưa bật
                </Tag>
              )}
            </div>
          </div>
          <div>
            {user?.isTwoFactorEnabled ? (
              <Button danger onClick={() => setShowDisable2FAModal(true)}>
                Tắt 2FA
              </Button>
            ) : (
              <Button type="primary" onClick={() => router.push("/settings/security/authentication")}>
                Bật 2FA
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
                Mật khẩu
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                Đổi mật khẩu định kỳ để tăng cường bảo mật tài khoản.
              </Paragraph>
            </div>
          </div>
          <Button onClick={() => setShowChangePasswordModal(true)}>
            Đổi mật khẩu
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
                Thiết bị & Phiên đăng nhập
              </Title>
              <Paragraph type="secondary" className="mb-0!">
                Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn.
              </Paragraph>
            </div>
          </div>
          <Button onClick={() => router.push("/settings/security/sessions")}>
            Quản lý thiết bị
          </Button>
        </div>
      </Card>

      {/* Disable 2FA Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined className="mr-2 text-orange-500" />
            Tắt xác thực hai lớp
          </span>
        }
        open={showDisable2FAModal}
        onCancel={() => setShowDisable2FAModal(false)}
        footer={null}
      >
        <Alert
          message="Cảnh báo"
          description="Tắt 2FA sẽ làm giảm bảo mật của tài khoản. Bạn có chắc chắn muốn tiếp tục?"
          type="warning"
          showIcon
          className="mb-4"
        />
        <Form
          name="disable-2fa"
          onFinish={handleDisable2FA}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label="Nhập mật khẩu để xác nhận"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setShowDisable2FAModal(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Tắt 2FA
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
            Đổi mật khẩu
          </span>
        }
        open={showChangePasswordModal}
        onCancel={() => setShowChangePasswordModal(false)}
        footer={null}
        width={480}
      >
        <Form
          name="change-password"
          onFinish={handleChangePassword}
          layout="vertical"
          requiredMark={false}
          initialValues={{ logoutAllDevices: false }}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Mật khẩu phải có chữ hoa, chữ thường và số!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item name="logoutAllDevices" valuePropName="checked">
            <Space>
              <Switch />
              <span>Đăng xuất tất cả thiết bị khác sau khi đổi mật khẩu</span>
            </Space>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setShowChangePasswordModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
