"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Spin } from "antd";

export default function ProfilePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to settings/profile
        router.replace("/settings/profile");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spin size="large" />
        </div>
    );
}
