/**
 * Library exports
 * 
 * Central export point for all library modules organized by layer.
 */

// ==================== CORE ====================

// API Client (base client)
export { default as apiClient, ApiError } from "./api-client";

// API Types and Utilities
export { isFailure, isSuccess, unwrapResult, wrapResponse } from "./api/api-utils";
export type { I_Return, I_ReturnBase, I_ReturnFailure, I_ReturnSuccess } from "./types/api";

// API Services (feature-based modules)
export * from "./api";

// ==================== LAYERS ====================

// Contexts (React context providers)
export * from "./contexts";

// Hooks (custom React hooks)
export * from "./hooks";

// Utils (utility functions)
export * from "./utils";

// Config (application configuration)
export * from "./config";

// Constants
export * from "./constants";

// Types
export type * from "./types";
