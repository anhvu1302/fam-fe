"use client";

import { useState } from "react";

import { CameraOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Form,
    message,
    Progress,
    Space,
    Typography,
    Upload,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

import { tokenStorage } from "@/lib/token-storage";
import type { UserInfo } from "@/types/auth";

const { Title, Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AvatarPage() {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const user = tokenStorage.getUser() as UserInfo | null;

    // Handle file change
    const beforeUpload = (file: RcFile) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            message.error("Kích thước file không được vượt quá 5MB!");
            return false;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
            message.error("Vui lòng chọn file hình ảnh!");
            return false;
        }

        return true;
    };

    // Handle file select
    const handleChange = (info: { file: UploadFile }) => {
        if (info.file.status === "done" || info.file.status === "uploading") {
            setFileList([info.file]);

            // Show preview
            if (info.file.originFileObj) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target?.result as string);
                };
                reader.readAsDataURL(info.file.originFileObj);
            }
        }
    };

    // Upload avatar
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.error("Vui lòng chọn hình ảnh!");
            return;
        }

        setUploading(true);
        try {
            // TODO: Replace with real API call
            // const file = fileList[0].originFileObj as RcFile;
            // const formData = new FormData();
            // formData.append("file", file);
            // 
            // const response = await apiClient.post("/api/users/me/avatar/upload", formData, {
            //   headers: { "Content-Type": "multipart/form-data" },
            //   onUploadProgress: (progressEvent) => {
            //     const percentCompleted = Math.round(
            //       (progressEvent.loaded * 100) / (progressEvent.total || 1)
            //     );
            //     setUploadProgress(percentCompleted);
            //   },
            // });

            // Simulate upload
            for (let i = 0; i <= 100; i += 20) {
                setUploadProgress(i);
                await new Promise((resolve) => setTimeout(resolve, 200));
            }

            message.success("Cập nhật ảnh đại diện thành công!");
            setFileList([]);
            setPreviewUrl("");

            // Update user in storage
            const updatedUser = {
                ...user,
                avatarUrl: previewUrl || user?.avatarUrl,
            };
            tokenStorage.setUser(updatedUser);
        } catch {
            message.error("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Remove file
    const handleRemove = () => {
        setFileList([]);
        setPreviewUrl("");
        setUploadProgress(0);
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Đổi ảnh đại diện
                </Title>
                <Text type="secondary">Tải lên ảnh đại diện mới cho tài khoản của bạn</Text>
            </div>

            <Alert
                title="Lưu ý"
                description="Kích thước tệp tối đa: 5MB. Định dạng hỗ trợ: JPG, PNG, GIF"
                type="info"
                showIcon
                className="mb-6"
            />

            <Card>
                {/* Current Avatar */}
                {user?.avatarUrl && (
                    <div className="mb-6">
                        <Text strong className="block mb-2">
                            Ảnh đại diện hiện tại
                        </Text>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={user.avatarUrl}
                            alt="Current avatar"
                            className="h-32 w-32 rounded-lg object-cover"
                        />
                    </div>
                )}

                {/* Upload Area */}
                <Form layout="vertical">
                    <Form.Item label="Chọn ảnh mới">
                        <Upload
                            beforeUpload={beforeUpload}
                            onChange={handleChange}
                            maxCount={1}
                            accept="image/*"
                            disabled={uploading}
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="mb-6">
                            <Text strong className="block mb-2">
                                Xem trước
                            </Text>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-32 w-32 rounded-lg object-cover"
                            />
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="mb-6">
                            <Progress
                                percent={uploadProgress}
                                status={uploadProgress === 100 ? "success" : "active"}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                icon={<CameraOutlined />}
                                onClick={handleUpload}
                                loading={uploading}
                                disabled={fileList.length === 0}
                            >
                                {uploading ? "Đang tải..." : "Tải lên"}
                            </Button>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={handleRemove}
                                disabled={fileList.length === 0 || uploading}
                                danger
                            >
                                Xóa
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
