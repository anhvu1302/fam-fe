"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Space,
    Typography,
} from "antd";

import authApi from "@/lib/api/auth";
import { useI18n } from "@/lib/i18n-context";
import { tokenStorage } from "@/lib/token-storage";
import { useUser } from "@/lib/user-context";


const { Title, Text } = Typography;

export default function AccountSettingsPage() {
    const { t } = useI18n();
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    // Change Password
    const handleChangePassword = async (values: {
        currentPassword: string;
        newPassword: string;
    }) => {
        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                logoutAllDevices: false,
            });

            message.success(t("settings.changePasswordSuccess", "Password changed successfully!"));
            setShowChangePasswordModal(false);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : t("settings.changePasswordFailed", "Failed to change password. Please try again.");
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Delete Account
    const handleDeleteAccount = async (_values: { password: string }) => {
        setLoading(true);
        try {
            // TODO: Implement delete account API
            message.success(t("common.success", "Success"));
            tokenStorage.clear();
            router.push("/login");
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : t("common.error", "An error occurred");
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    {t("settings.account", "Account")}
                </Title>
                <Text type="secondary">
                    {t("settings.accountInformation", "Account information")}
                </Text>
            </div>

            {/* Account Information */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">
                    {t("settings.accountInformation", "Account information")}
                </Title>
                <Descriptions
                    column={1}
                    items={[
                        {
                            key: "username",
                            label: t("settings.username", "Username"),
                            children: user?.username || "N/A",
                        },
                        {
                            key: "email",
                            label: t("settings.emailAddress", "Email address"),
                            children: user?.email || "N/A",
                        },
                    ]}
                />
            </Card>

            {/* Change Password */}
            <Card className="mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <LockOutlined className="text-xl text-blue-600" />
                        </div>
                        <div>
                            <Title level={4} className="mb-1!">
                                {t("settings.changePassword", "Change password")}
                            </Title>
                            <Text type="secondary">
                                {t("common.description", "Update your password regularly to keep your account secure")}
                            </Text>
                        </div>
                    </div>
                    <Button onClick={() => setShowChangePasswordModal(true)}>
                        {t("settings.changePassword", "Change password")}
                    </Button>
                </div>
            </Card>

            {/* Delete Account */}
            <Card>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <DeleteOutlined className="text-xl text-red-600" />
                        </div>
                        <div>
                            <Title level={4} className="mb-1!">
                                {t("settings.deleteAccount", "Delete account")}
                            </Title>
                            <Text type="secondary">
                                {t("common.description", "Permanently delete your account and all associated data")}
                            </Text>
                        </div>
                    </div>
                    <Button danger onClick={() => setShowDeleteAccountModal(true)}>
                        {t("settings.deleteAccount", "Delete account")}
                    </Button>
                </div>
            </Card>

            {/* Change Password Modal */}
            <Modal
                title={
                    <span>
                        <LockOutlined className="mr-2" />
                        {t("settings.changePassword", "Change password")}
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
                >
                    <Form.Item
                        name="currentPassword"
                        label={t("settings.currentPassword", "Current password")}
                        rules={[{ required: true, message: t("settings.enterCurrentPassword", "Enter current password") }]}
                    >
                        <Input.Password placeholder={t("settings.enterCurrentPassword", "Enter current password")} />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label={t("settings.newPassword", "New password")}
                        rules={[
                            { required: true, message: t("settings.enterNewPassword", "Enter new password") },
                            { min: 8, message: t("settings.passwordRequirements", "Password must be at least 8 characters and include uppercase, lowercase, and numbers") },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                message: t("settings.passwordRequirements", "Password must be at least 8 characters and include uppercase, lowercase, and numbers"),
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder={t("settings.enterNewPassword", "Enter new password")} />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label={t("settings.confirmPassword", "Confirm new password")}
                        dependencies={["newPassword"]}
                        hasFeedback
                        rules={[
                            { required: true, message: t("settings.confirmNewPasswordLabel", "Confirm new password") },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t("settings.passwordMismatch", "Passwords do not match")));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder={t("settings.confirmNewPasswordLabel", "Confirm new password")} />
                    </Form.Item>                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => setShowChangePasswordModal(false)}>{t("common.cancel", "Cancel")}</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {t("settings.changePassword", "Change password")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                title={
                    <span>
                        <ExclamationCircleOutlined className="mr-2 text-red-500" />
                        {t("settings.deleteAccount", "Delete account")}
                    </span>
                }
                open={showDeleteAccountModal}
                onCancel={() => setShowDeleteAccountModal(false)}
                footer={null}
            >
                <Alert
                    message={t("common.warning", "Warning")}
                    description={t("settings.deleteAccountWarning", "This action cannot be undone. All your data will be permanently deleted.")}
                    type="error"
                    showIcon
                    className="mb-4"
                />
                <Form
                    name="delete-account"
                    onFinish={handleDeleteAccount}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="password"
                        label={t("settings.enterPassword", "Enter your password to confirm")}
                        rules={[{ required: true, message: t("settings.enterPassword", "Enter your password to confirm") }]}
                    >
                        <Input.Password placeholder={t("settings.currentPassword", "Current password")} />
                    </Form.Item>
                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => setShowDeleteAccountModal(false)}>{t("common.cancel", "Cancel")}</Button>
                            <Button type="primary" danger htmlType="submit" loading={loading}>
                                {t("settings.deleteAccount", "Delete account")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
