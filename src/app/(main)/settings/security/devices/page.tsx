"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeftOutlined,
  ChromeOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  MobileOutlined,
  ReloadOutlined,
  SafetyOutlined,
  TabletOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  List,
  message,
  Modal,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import authApi from "@/lib/api/auth";
import type { UserDeviceResponse } from "@/types/auth";

const { Title, Text } = Typography;

// Mock data for demonstration (replace with real API when available)
const mockDevices: UserDeviceResponse[] = [
  {
    id: "1",
    deviceId: "device-001",
    deviceName: "Chrome trên MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome",
    browserVersion: "120.0",
    os: "macOS",
    osVersion: "14.1",
    ipAddress: "192.168.1.100",
    location: "Hồ Chí Minh, Việt Nam",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: true,
    isOnline: true,
  },
  {
    id: "2",
    deviceId: "device-002",
    deviceName: "Safari trên iPhone 15",
    deviceType: "mobile",
    browser: "Safari",
    browserVersion: "17.0",
    os: "iOS",
    osVersion: "17.1",
    ipAddress: "192.168.1.101",
    location: "Hồ Chí Minh, Việt Nam",
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
    isOnline: false,
  },
  {
    id: "3",
    deviceId: "device-003",
    deviceName: "Firefox trên Windows",
    deviceType: "desktop",
    browser: "Firefox",
    browserVersion: "121.0",
    os: "Windows",
    osVersion: "11",
    ipAddress: "10.0.0.50",
    location: "Hà Nội, Việt Nam",
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
    isOnline: false,
  },
];

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<UserDeviceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Load devices
  const loadDevices = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call when available
      // const response = await apiClient.get('/api/auth/devices');
      // setDevices(response.data);
      
      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDevices(mockDevices);
    } catch {
      message.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Revoke device session
  const revokeDevice = async (deviceId: string) => {
    Modal.confirm({
      title: "Thu hồi phiên đăng nhập?",
      icon: <ExclamationCircleOutlined />,
      content: "Thiết bị này sẽ bị đăng xuất và cần đăng nhập lại để tiếp tục sử dụng.",
      okText: "Thu hồi",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setRevoking(deviceId);
        try {
          // TODO: Replace with real API call
          // await apiClient.delete(`/api/auth/devices/${deviceId}`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          setDevices((prev) => prev.filter((d) => d.id !== deviceId));
          message.success("Đã thu hồi phiên đăng nhập!");
        } catch {
          message.error("Không thể thu hồi phiên đăng nhập");
        } finally {
          setRevoking(null);
        }
      },
    });
  };

  // Logout all other devices
  const logoutAllOther = async () => {
    Modal.confirm({
      title: "Đăng xuất tất cả thiết bị khác?",
      icon: <ExclamationCircleOutlined />,
      content: "Tất cả thiết bị khác sẽ bị đăng xuất. Chỉ giữ lại phiên hiện tại.",
      okText: "Đăng xuất tất cả",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await authApi.logoutAll(true);
          setDevices((prev) => prev.filter((d) => d.isCurrent));
          message.success("Đã đăng xuất tất cả thiết bị khác!");
        } catch {
          message.error("Không thể đăng xuất các thiết bị khác");
        }
      },
    });
  };

  // Get device icon
  const getDeviceIcon = (type: string | null) => {
    switch (type) {
      case "mobile":
        return <MobileOutlined className="text-2xl" />;
      case "tablet":
        return <TabletOutlined className="text-2xl" />;
      default:
        return <DesktopOutlined className="text-2xl" />;
    }
  };

  // Get browser icon
  const getBrowserIcon = (browser: string | null) => {
    if (browser?.toLowerCase().includes("chrome")) {
      return <ChromeOutlined />;
    }
    return <GlobalOutlined />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/settings/security")}
          />
          <div>
            <Title level={2} className="mb-0!">
              <SafetyOutlined className="mr-2" />
              Thiết bị đăng nhập
            </Title>
            <Text type="secondary">
              Quản lý các thiết bị đang đăng nhập vào tài khoản
            </Text>
          </div>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadDevices} loading={loading}>
            Làm mới
          </Button>
          {devices.filter((d) => !d.isCurrent).length > 0 && (
            <Button danger onClick={logoutAllOther}>
              Đăng xuất tất cả thiết bị khác
            </Button>
          )}
        </Space>
      </div>

      {/* Alert */}
      <Alert
        message="Bảo mật tài khoản"
        description="Nếu bạn thấy thiết bị lạ, hãy thu hồi phiên đăng nhập và đổi mật khẩu ngay lập tức."
        type="info"
        showIcon
        className="mb-6"
      />

      {/* Devices List */}
      <Card>
        {loading ? (
          <List
            dataSource={[1, 2, 3]}
            renderItem={() => (
              <List.Item>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </List.Item>
            )}
          />
        ) : devices.length === 0 ? (
          <Empty description="Không có thiết bị nào" />
        ) : (
          <List
            dataSource={devices}
            renderItem={(device) => (
              <List.Item
                actions={[
                  device.isCurrent ? (
                    <Tag color="blue" key="current">
                      Thiết bị hiện tại
                    </Tag>
                  ) : (
                    <Button
                      key="revoke"
                      danger
                      icon={<DeleteOutlined />}
                      loading={revoking === device.id}
                      onClick={() => revokeDevice(device.id)}
                    >
                      Thu hồi
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Badge dot status={device.isOnline ? "success" : "default"}>
                        {getDeviceIcon(device.deviceType)}
                      </Badge>
                    </div>
                  }
                  title={
                    <Space>
                      <span>{device.deviceName || "Thiết bị không xác định"}</span>
                      {device.isOnline && (
                        <Tag color="green" className="ml-2">
                          Đang hoạt động
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <Tooltip title="Trình duyệt">
                          <span>
                            {getBrowserIcon(device.browser)} {device.browser}{" "}
                            {device.browserVersion}
                          </span>
                        </Tooltip>
                        <span>•</span>
                        <span>
                          {device.os} {device.osVersion}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Tooltip title="Địa chỉ IP">
                          <span>
                            <GlobalOutlined className="mr-1" />
                            {device.ipAddress || "N/A"}
                          </span>
                        </Tooltip>
                        {device.location && (
                          <>
                            <span>•</span>
                            <Tooltip title="Vị trí">
                              <span>
                                <EnvironmentOutlined className="mr-1" />
                                {device.location}
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </div>
                      <div>
                        <Text type="secondary">
                          Hoạt động lần cuối: {getRelativeTime(device.lastActiveAt)} (
                          {formatDate(device.lastActiveAt)})
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
