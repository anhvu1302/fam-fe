"use client";

import { useState } from "react";

import { LockOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Space, Switch, Typography } from "antd";

import authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";

const { Title, Text } = Typography;

interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    logoutAllDevices: boolean;
}

export default function ChangePasswordPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (values: ChangePasswordFormValues) => {
        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                logoutAllDevices: values.logoutAllDevices,
            });

            message.success("Đổi mật khẩu thành công!");
            form.resetFields();

            // If logout all devices is selected, redirect to login
            if (values.logoutAllDevices) {
                setTimeout(() => {
                    tokenStorage.clear();
                    window.location.href = "/login";
                }, 1500);
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
        <div className="max-w-2xl">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Đổi mật khẩu
                </Title>
                <Text type="secondary">Cập nhật mật khẩu của bạn để tăng cường bảo mật</Text>
            </div>

            <Alert
                message="Lưu ý"
                description="Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
                type="info"
                showIcon
                className="mb-6"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                requiredMark={false}
            >
                <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                    />
                </Form.Item>

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
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    name="logoutAllDevices"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Space>
                        <Switch />
                        <span>Đăng xuất tất cả thiết bị khác sau khi đổi mật khẩu</span>
                    </Space>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Đổi mật khẩu
                        </Button>
                        <Button onClick={() => form.resetFields()}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}
