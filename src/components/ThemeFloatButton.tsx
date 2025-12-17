"use client";

import { SettingOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

import SettingDrawer from "@/components/SettingDrawer";
import { useTheme } from "@/lib/contexts/theme-context";

export default function ThemeFloatButton() {
    const { toggleSettingsDrawer } = useTheme();

    const handleOpenSettingsDrawer = () => {
        toggleSettingsDrawer(true);
    };

    return (
        <>
            <FloatButton
                onClick={handleOpenSettingsDrawer}
                type="primary"
                style={{ insetInlineEnd: 24 }}
                icon={<SettingOutlined />}
            />
            <SettingDrawer />
        </>
    );
}
