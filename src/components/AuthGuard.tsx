"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Spin } from "antd";

import { tokenStorage } from "@/lib/token-storage";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Auth Guard Component
 * Protects routes that require authentication
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const authenticated = await tokenStorage.verifyAuthentication();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        router.replace("/login");
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);  // Show loading while checking
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
