"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DesktopOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  ReloadOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Empty,
  message,
  Modal,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import sessionsApi, { type UserSession } from "@/lib/api/sessions";
import { getDeviceId as _getDeviceId } from "@/lib/device-id";
import { useI18n } from "@/lib/i18n-context";

const { Title, Text } = Typography;

interface ConfirmModalState {
  visible: boolean;
  sessionId: string | null;
  isLogoutAll: boolean;
}

export default function SessionsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    visible: false,
    sessionId: null,
    isLogoutAll: false,
  });

  // Load sessions
  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.getAllSessions();
      const currentDeviceId = _getDeviceId();

      const sessionsWithCurrent = data.map((session) => ({
        ...session,
        isCurrentDevice: session.deviceId === currentDeviceId,
      }));

      setSessions(sessionsWithCurrent);
    } catch {
      messageApi.error(t("common.error", "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke device session
  const revokeDevice = useCallback(
    (sessionId: string) => {
      setConfirmModal({
        visible: true,
        sessionId,
        isLogoutAll: false,
      });
    },
    []
  );

  // Logout all other devices
  const logoutAllOther = useCallback(() => {
    setConfirmModal({
      visible: true,
      sessionId: null,
      isLogoutAll: true,
    });
  }, []);

  // Handle confirm modal actions
  const handleConfirmOk = useCallback(async () => {
    try {
      if (confirmModal.isLogoutAll) {
        try {
          await sessionsApi.deleteAllSessions();
          setSessions((prev) => prev.filter((s) => s.isCurrentDevice));
          messageApi.success(t("common.success", "Success"));
          setConfirmModal({ visible: false, sessionId: null, isLogoutAll: false });
        } catch (error) {
          messageApi.error((error as Error).message || t("common.error", "An error occurred"));
        }
      } else if (confirmModal.sessionId) {
        const revokedSession = sessions.find((s) => s.id === confirmModal.sessionId);
        setRevoking(confirmModal.sessionId);
        try {
          await sessionsApi.deleteSession(confirmModal.sessionId);

          // If revoking current device, logout
          if (revokedSession?.isCurrentDevice) {
            messageApi.warning(t("common.description", "Current device revoked. Logging out..."));
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          } else {
            // Only remove if not current device
            setSessions((prev) => prev.filter((s) => s.id !== confirmModal.sessionId));
            messageApi.success(t("common.success", "Success"));
          }
        } catch (error) {
          messageApi.error((error as Error).message || t("common.error", "An error occurred"));
        } finally {
          setRevoking(null);
          setConfirmModal({ visible: false, sessionId: null, isLogoutAll: false });
        }
      }
    } catch (error) {
      messageApi.error((error as Error).message || t("common.error", "An error occurred"));
    }
  }, [confirmModal, sessions, t, router, messageApi]);

  // Format date with error handling
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  // Get relative time with error handling and Vietnamese translations
  const getRelativeTime = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes} phút trước`;
      if (hours < 24) return `${hours} giờ trước`;
      if (days < 7) return `${days} ngày trước`;
      if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
      return `${Math.floor(days / 30)} tháng trước`;
    } catch {
      return "N/A";
    }
  };

  return (
    <>
      {messageContextHolder}
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
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={loadDevices} loading={loading}>
              Làm mới
            </Button>
            {sessions.filter((s) => !s.isCurrentDevice).length > 0 && (
              <Button danger onClick={logoutAllOther}>
                Đăng xuất tất cả thiết bị khác
              </Button>
            )}
          </div>
        </div>

        {/* Alert */}
        <Alert
          title="Bảo mật tài khoản"
          description="Nếu bạn thấy thiết bị lạ, hãy thu hồi phiên đăng nhập và đổi mật khẩu ngay lập tức."
          type="info"
          showIcon
          className="mb-6"
        />

        {/* Devices List */}
        <Card>
          {loading ? (
            <div>
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-4">
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <Empty description="Không có thiết bị nào" />
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shrink-0">
                      <DesktopOutlined className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="font-medium text-base">
                          {session.deviceName || "Thiết bị không xác định"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        {session.browser && (
                          <div className="flex items-center gap-4">
                            <Tooltip title="Trình duyệt">
                              <span className="truncate max-w-md">{session.browser}</span>
                            </Tooltip>
                          </div>
                        )}
                        {session.operatingSystem && (
                          <div className="flex items-center gap-4">
                            <Tooltip title="Hệ điều hành">
                              <span className="truncate max-w-md">{session.operatingSystem}</span>
                            </Tooltip>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Tooltip title="Địa chỉ IP">
                            <span>
                              <GlobalOutlined className="mr-1" />
                              {session.ipAddress || "N/A"}
                            </span>
                          </Tooltip>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-4">
                            <Tooltip title="Vị trí">
                              <span>{session.location}</span>
                            </Tooltip>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Text type="secondary">
                            Hoạt động lần cuối: {getRelativeTime(session.lastActivityAt)} (
                            {formatDate(session.lastActivityAt)})
                          </Text>
                        </div>
                        <div className="flex items-center gap-4">
                          <Text type="secondary">
                            Đăng nhập lần cuối: {formatDate(session.lastLoginAt)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    {session.isCurrentDevice ? (
                      <Tag color="blue">Thiết bị hiện tại</Tag>
                    ) : (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={revoking === session.id}
                        onClick={() => revokeDevice(session.id)}
                      >
                        Thu hồi
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Confirm Modal */}
        <Modal
          title={
            confirmModal.isLogoutAll
              ? t("common.confirm", "Are you sure?")
              : t("settings.revokeAccess", "Revoke access")
          }
          open={confirmModal.visible}
          onCancel={() => setConfirmModal({ visible: false, sessionId: null, isLogoutAll: false })}
          okText={
            confirmModal.isLogoutAll
              ? t("common.logoutAll", "Logout all")
              : t("settings.revokeAccess", "Revoke access")
          }
          okType="danger"
          cancelText={t("common.cancel", "Cancel")}
          loading={revoking !== null}
          onOk={handleConfirmOk}
        >
          {confirmModal.isLogoutAll
            ? t("common.description", "All other devices will be logged out. Only keep the current session.")
            : t("common.description", "This device will be logged out and need to login again to continue using.")}
        </Modal>
      </div>
    </>
  );
}
