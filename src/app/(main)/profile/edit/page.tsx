"use client";

import { useState } from "react";

import { Button, Form, Input, message, Typography } from "antd";

import { tokenStorage } from "@/lib/token-storage";
import type { UserInfo } from "@/types/auth";

const { Title, Text } = Typography;

interface EditProfileFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export default function EditProfilePage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const user = tokenStorage.getUser() as UserInfo | null;

    const onSubmit = async (values: EditProfileFormValues) => {
        setLoading(true);
        try {
            // TODO: Call API to update user profile
            // const response = await apiClient.put(`/api/users/${user?.id}`, values);

            // For now, just show success message
            message.success("Cập nhật thông tin thành công!");

            // Update local storage
            const updatedUser = {
                ...user,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
            };
            tokenStorage.setUser(updatedUser);
        } catch {
            message.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Sửa thông tin cá nhân
                </Title>
                <Text type="secondary">Cập nhật thông tin cá nhân của bạn</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                initialValues={{
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    email: user?.email || "",
                    phoneNumber: "",
                }}
                requiredMark={false}
            >
                <Form.Item
                    name="firstName"
                    label="Họ"
                    rules={[
                        { required: true, message: "Vui lòng nhập họ!" },
                        { max: 100, message: "Họ tối đa 100 ký tự!" },
                    ]}
                >
                    <Input placeholder="Họ" />
                </Form.Item>

                <Form.Item
                    name="lastName"
                    label="Tên"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên!" },
                        { max: 100, message: "Tên tối đa 100 ký tự!" },
                    ]}
                >
                    <Input placeholder="Tên" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                >
                    <Input placeholder="email@example.com" disabled />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                        { pattern: /^[0-9]{10,15}$/, message: "Số điện thoại không hợp lệ!" },
                    ]}
                >
                    <Input placeholder="0123456789" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
