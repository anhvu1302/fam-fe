import type { ThemeConfig } from "antd";

// Custom colors
const colors = {
  primary: "#1890ff", // Blue
  success: "#52c41a", // Green
  warning: "#faad14", // Yellow
  error: "#ff4d4f", // Red
  info: "#1890ff", // Blue

  // Custom brand colors - thay đổi ở đây để đổi màu chủ đạo
  brand: {
    primary: "#1890ff",
    secondary: "#722ed1",
    accent: "#13c2c2",
  },

  // Neutral colors
  neutral: {
    title: "rgba(0, 0, 0, 0.88)",
    text: "rgba(0, 0, 0, 0.65)",
    secondary: "rgba(0, 0, 0, 0.45)",
    disabled: "rgba(0, 0, 0, 0.25)",
    border: "#d9d9d9",
    divider: "rgba(5, 5, 5, 0.06)",
    background: "#f5f5f5",
    containerBg: "#ffffff",
  },
};

// Light theme config
export const lightTheme: ThemeConfig = {
  token: {
    // Primary color - màu chủ đạo
    colorPrimary: colors.brand.primary,

    // Success/Warning/Error colors
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Font
    fontFamily:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Motion
    motion: true,
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",

    // Layout
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    // Button customization
    Button: {
      algorithm: true,
      primaryShadow: "0 2px 0 rgba(24, 144, 255, 0.1)",
      defaultBorderColor: colors.neutral.border,
    },

    // Input customization
    Input: {
      algorithm: true,
      activeBorderColor: colors.brand.primary,
      hoverBorderColor: colors.brand.primary,
    },

    // Menu customization (Sidebar)
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
      darkItemSelectedBg: colors.brand.primary,
      darkItemHoverBg: "rgba(255, 255, 255, 0.08)",
      itemHeight: 40,
      iconSize: 16,
    },

    // Layout customization
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#001529",
      bodyBg: "#f0f2f5",
      headerHeight: 64,
      headerPadding: "0 24px",
    },

    // Card customization
    Card: {
      headerBg: "transparent",
      paddingLG: 24,
    },

    // Table customization
    Table: {
      headerBg: "#fafafa",
      headerColor: colors.neutral.title,
      rowHoverBg: "#f5f5f5",
      borderColor: colors.neutral.border,
    },

    // Form customization
    Form: {
      labelColor: colors.neutral.title,
      labelFontSize: 14,
      verticalLabelPadding: "0 0 8px",
    },

    // Modal customization
    Modal: {
      titleFontSize: 16,
      headerBg: "#ffffff",
      contentBg: "#ffffff",
    },

    // Message customization
    Message: {
      contentPadding: "10px 16px",
    },
  },
};

// Dark theme config (optional - có thể dùng sau)
export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.brand.primary,
    colorBgBase: "#141414",
    colorTextBase: "#ffffff",
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    borderRadius: 6,
  },
  components: {
    Menu: {
      darkItemBg: "#1f1f1f",
      darkSubMenuItemBg: "#141414",
      darkItemSelectedBg: colors.brand.primary,
    },
    Layout: {
      headerBg: "#1f1f1f",
      siderBg: "#1f1f1f",
      bodyBg: "#141414",
    },
  },
};

// Export default theme
export const antdTheme = lightTheme;

// Theme presets - dễ dàng đổi màu chủ đạo
export const themePresets = {
  blue: "#1890ff",
  purple: "#722ed1",
  cyan: "#13c2c2",
  green: "#52c41a",
  magenta: "#eb2f96",
  red: "#f5222d",
  orange: "#fa8c16",
  gold: "#faad14",
  lime: "#a0d911",
  geekblue: "#2f54eb",
};

// Helper function để tạo theme với màu custom
export function createTheme(primaryColor: string): ThemeConfig {
  return {
    ...lightTheme,
    token: {
      ...lightTheme.token,
      colorPrimary: primaryColor,
    },
  };
}
