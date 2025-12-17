"use client";

import { useState } from "react";

import { Spin } from "antd";

import { useAuthCheck } from "@/lib/hooks/use-auth-check";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Auth Guard Component
 * Protects routes that require authentication
 * Does NOT call /auth/me - that's handled by main layout
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useAuthCheck({
    refreshUserData: false, // Don't call /auth/me here
    onAuthSuccess: () => {
      setIsAuthenticated(true);
      setIsChecking(false);
    },
    onAuthFailed: () => {
      setIsAuthenticated(false);
      setIsChecking(false);
    },
  });
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
