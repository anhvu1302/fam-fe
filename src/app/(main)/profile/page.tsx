"use client";

import { useMemo, useState } from "react";

import {
    CalendarOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Descriptions, Empty, Skeleton, Space, Tag, Typography } from "antd";

import { useI18n } from "@/lib/i18n-context";
import { getUserAvatarUrl } from "@/lib/minio-url";
import { tokenStorage } from "@/lib/token-storage";
import type { UserInfo } from "@/types/auth";

const { Title, Text } = Typography;

export default function ProfilePage() {
    const { t } = useI18n();
    const [loading] = useState(false);
    const user = useMemo<UserInfo | null>(() => {
        return (tokenStorage.getUser() as UserInfo | null) || null;
    }, []);

    if (loading) {
        return (
            <div>
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        );
    }

    if (!user) {
        return <Empty description={t("profile.notFound", "Không tìm thấy thông tin người dùng")} />;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Title level={2} className="mb-2">
                    {t("profile.profile", "Thông tin cá nhân")}
                </Title>
                <Text type="secondary">{t("profile.viewDetails", "Xem chi tiết tài khoản của bạn")}</Text>
            </div>

            {/* Avatar & Basic Info */}
            <Card className="mb-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    <div className="flex flex-col items-center gap-3">
                        <Avatar size={120} icon={<UserOutlined />} src={getUserAvatarUrl(user)} />
                        <Button type="primary" href="/settings/profile">
                            {t("profile.changeAvatar", "Thay đổi ảnh")}
                        </Button>
                    </div>

                    <div className="flex-1">
                        <div className="mb-4">
                            <Title level={3} className="mb-0">
                                {user.firstName || user.username || t("profile.user", "Người dùng")}
                            </Title>
                            <Text type="secondary">@{user.username || "N/A"}</Text>
                        </div>

                        <Space size="middle">
                            {user.isEmailVerified ? (
                                <Tag color="success">{t("profile.emailVerified", "Email đã xác minh")}</Tag>
                            ) : (
                                <Tag color="warning">{t("profile.emailNotVerified", "Email chưa xác minh")}</Tag>
                            )}
                            {user.isTwoFactorEnabled ? (
                                <Tag color="blue">{t("profile.twoFactorEnabled", "2FA đã bật")}</Tag>
                            ) : (
                                <Tag color="default">{t("profile.twoFactorDisabled", "2FA chưa bật")}</Tag>
                            )}
                        </Space>
                    </div>
                </div>
            </Card>

            {/* Detailed Info */}
            <Card>
                <Title level={4} className="mb-4">
                    {t("profile.personalInfo", "Thông tin chi tiết")}
                </Title>
                <Descriptions
                    column={1}
                    size="middle"
                    items={[
                        {
                            key: "1",
                            label: (
                                <span>
                                    <UserOutlined className="mr-2" />
                                    {t("profile.username", "Tên người dùng")}
                                </span>
                            ),
                            children: user.username || "N/A",
                        },
                        {
                            key: "2",
                            label: (
                                <span>
                                    <UserOutlined className="mr-2" />
                                    {t("profile.lastName", "Họ")}
                                </span>
                            ),
                            children: user.firstName || "N/A",
                        },
                        {
                            key: "3",
                            label: (
                                <span>
                                    <UserOutlined className="mr-2" />
                                    {t("profile.firstName", "Tên")}
                                </span>
                            ),
                            children: user.lastName || "N/A",
                        },
                        {
                            key: "4",
                            label: (
                                <span>
                                    <MailOutlined className="mr-2" />
                                    {t("profile.email", "Email")}
                                </span>
                            ),
                            children: user.email || "N/A",
                        },
                        {
                            key: "5",
                            label: (
                                <span>
                                    <PhoneOutlined className="mr-2" />
                                    {t("profile.phone", "Số điện thoại")}
                                </span>
                            ),
                            children: "N/A",
                        },
                        {
                            key: "6",
                            label: (
                                <span>
                                    <CalendarOutlined className="mr-2" />
                                    {t("profile.username", "ID người dùng")}
                                </span>
                            ),
                            children: user.id,
                        },
                    ]}
                />

                <div className="mt-6 flex gap-2">
                    <Button type="primary" href="/settings/profile">
                        {t("profile.editProfile", "Sửa thông tin")}
                    </Button>
                    <Button href="/settings/account">{t("auth.changePassword", "Đổi mật khẩu")}</Button>
                </div>
            </Card>
        </div>
    );
}
