"use client";

import { useState } from "react";

import {
    CameraOutlined,
    DeleteOutlined,
    UploadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Avatar,
    Button,
    Card,
    Descriptions,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Progress,
    Space,
    Tag,
    Typography,
    Upload,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

import { useI18n } from "@/lib/contexts/i18n-context";
import { useUser } from "@/lib/contexts/user-context";
import { getUserAvatarUrl } from "@/lib/utils/minio-url";


const { Title, Text } = Typography;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface EditProfileFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export default function ProfileSettingsPage() {
    const { t } = useI18n();
    const { user, updateUser } = useUser();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    // Handle avatar upload
    const beforeUpload = (file: RcFile) => {
        if (file.size > MAX_FILE_SIZE) {
            message.error(t("avatar.sizeExceeded", "Kích thước file không được vượt quá 5MB!"));
            return false;
        }

        if (!file.type.startsWith("image/")) {
            message.error(t("avatar.invalidType", "Vui lòng chọn file hình ảnh!"));
            return false;
        }

        return true;
    };

    const handleFileChange = (info: { fileList: UploadFile[] }) => {
        setFileList(info.fileList);

        // Create preview URL
        if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(info.fileList[0].originFileObj as Blob);
        }
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning(t("avatar.selectFile", "Vui lòng chọn ảnh!"));
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj as Blob);

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // TODO: Replace with actual API call
            // const response = await apiClient.post('/api/users/avatar', formData);

            message.success(t("avatar.uploadSuccess", "Tải ảnh đại diện thành công!"));
            setAvatarModalVisible(false);
            setFileList([]);
            setPreviewUrl("");
            setUploadProgress(0);
        } catch {
            message.error(t("avatar.uploadError", "Không thể tải ảnh. Vui lòng thử lại."));
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = () => {
        Modal.confirm({
            title: t("avatar.confirmRemove", "Xác nhận xóa ảnh đại diện"),
            content: t("avatar.removeWarning", "Bạn có chắc chắn muốn xóa ảnh đại diện không?"),
            okText: t("common.confirm", "Xác nhận"),
            cancelText: t("common.cancel", "Hủy"),
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    // TODO: Call API to remove avatar
                    message.success(t("avatar.removeSuccess", "Đã xóa ảnh đại diện!"));
                } catch {
                    message.error(t("avatar.removeError", "Không thể xóa ảnh. Vui lòng thử lại."));
                }
            },
        });
    };

    // Handle profile update
    const onSubmit = async (values: EditProfileFormValues) => {
        setLoading(true);
        try {
            // TODO: Call API to update user profile
            message.success(t("profile.profileUpdated", "Cập nhật thông tin thành công!"));

            // Update user in context (memory)
            updateUser({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
            });
            setEditMode(false);
        } catch {
            message.error(t("profile.updateError", "Không thể cập nhật thông tin. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Empty description={t("profile.notFound", "Không tìm thấy thông tin người dùng")} />;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Public profile
                </Title>
                <Text type="secondary">
                    Your profile information is visible to all members of your organization
                </Text>
            </div>

            {/* Avatar Section */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">
                    Profile picture
                </Title>
                <div className="flex items-center gap-6">
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        src={getUserAvatarUrl(user)}
                    />
                    <Space>
                        <Button
                            icon={<CameraOutlined />}
                            onClick={() => setAvatarModalVisible(true)}
                        >
                            {t("profile.changeAvatar", "Đổi ảnh đại diện")}
                        </Button>
                        {user.avatar && (
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={handleRemoveAvatar}
                            >
                                {t("avatar.remove", "Xóa ảnh")}
                            </Button>
                        )}
                    </Space>
                </div>
            </Card>

            {/* Profile Info Section */}
            <Card>
                <div className="mb-4 flex items-center justify-between">
                    <Title level={4} className="mb-0">
                        Profile information
                    </Title>
                    {!editMode && (
                        <Button type="primary" onClick={() => setEditMode(true)}>
                            {t("common.edit", "Chỉnh sửa")}
                        </Button>
                    )}
                </div>

                {editMode ? (
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
                            label={t("settings.firstName", "First name")}
                            rules={[
                                { required: true, message: t("settings.firstNameRequired", "First name is required") },
                                { max: 100, message: t("settings.maximumCharacters", "Maximum {max} characters").replace("{max}", "100") },
                            ]}
                        >
                            <Input placeholder={t("settings.enterFirstName", "Enter your first name")} />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label={t("settings.lastName", "Last name")}
                            rules={[
                                { required: true, message: t("settings.lastNameRequired", "Last name is required") },
                                { max: 100, message: t("settings.maximumCharacters", "Maximum {max} characters").replace("{max}", "100") },
                            ]}
                        >
                            <Input placeholder={t("settings.enterLastName", "Enter your last name")} />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={t("settings.emailAddress", "Email address")}
                            rules={[
                                { required: true, message: t("settings.emailRequired", "Email is required") },
                                { type: "email", message: t("settings.invalidEmail", "Invalid email format") },
                            ]}
                        >
                            <Input placeholder={t("settings.enterEmail", "Enter your email")} />
                        </Form.Item>

                        <Form.Item
                            name="phoneNumber"
                            label={t("settings.phoneNumber", "Phone number")}
                        >
                            <Input placeholder={t("settings.enterPhoneNumber", "Enter your phone number")} />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {t("common.save", "Lưu")}
                                </Button>
                                <Button onClick={() => setEditMode(false)}>
                                    {t("common.cancel", "Hủy")}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                ) : (
                    <>
                        <Descriptions
                            column={1}
                            items={[
                                {
                                    key: "username",
                                    label: t("settings.username", "Username"),
                                    children: user.username || "N/A",
                                },
                                {
                                    key: "name",
                                    label: t("common.name", "Name"),
                                    children: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
                                },
                                {
                                    key: "email",
                                    label: "Email",
                                    children: (
                                        <Space>
                                            {user.email || "N/A"}
                                            {user.isEmailVerified ? (
                                                <Tag color="success">Verified</Tag>
                                            ) : (
                                                <Tag color="warning">Not verified</Tag>
                                            )}
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </>
                )}
            </Card>

            {/* Avatar Upload Modal */}
            <Modal
                title={
                    <span>
                        <CameraOutlined className="mr-2" />
                        {t("profile.changeAvatar", "Đổi ảnh đại diện")}
                    </span>
                }
                open={avatarModalVisible}
                onCancel={() => {
                    setAvatarModalVisible(false);
                    setFileList([]);
                    setPreviewUrl("");
                    setUploadProgress(0);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setAvatarModalVisible(false);
                            setFileList([]);
                            setPreviewUrl("");
                        }}
                    >
                        {t("common.cancel", "Hủy")}
                    </Button>,
                    <Button
                        key="upload"
                        type="primary"
                        loading={uploading}
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                    >
                        {t("avatar.upload", "Tải lên")}
                    </Button>,
                ]}
                width={500}
            >
                <Alert
                    message={t("avatar.requirements", "Yêu cầu")}
                    description={
                        <ul className="mb-0 pl-4">
                            <li>{t("avatar.maxSize", "Kích thước tối đa: 5MB")}</li>
                            <li>{t("avatar.formats", "Định dạng: JPG, PNG, GIF")}</li>
                            <li>{t("avatar.recommended", "Khuyến nghị: Ảnh vuông, tối thiểu 200x200px")}</li>
                        </ul>
                    }
                    type="info"
                    showIcon
                    className="mb-4"
                />

                <div className="text-center">
                    {previewUrl && (
                        <div className="mb-4">
                            <Avatar size={120} src={previewUrl} />
                        </div>
                    )}

                    <Upload
                        listType="picture"
                        fileList={fileList}
                        beforeUpload={beforeUpload}
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>
                            {t("avatar.selectImage", "Chọn ảnh")}
                        </Button>
                    </Upload>

                    {uploading && uploadProgress > 0 && (
                        <div className="mt-4">
                            <Progress percent={uploadProgress} />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
