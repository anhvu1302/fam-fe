"use client";

import Image from "next/image";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAppSettingsByGroup } from "@/hooks/use-app-settings";
import { getMinioUrl } from "@/lib/minio-url";

export function AuthLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { settings: brandingSettings } = useAppSettingsByGroup("branding");
    const { settings: featureSettings } = useAppSettingsByGroup("features");
    const { settings: footerSettings } = useAppSettingsByGroup("footer");

    // Extract feature data from settings
    const features = [
        {
            title: featureSettings["app.features.feature1Title"] || "Quản lý tập trung",
            description:
                featureSettings["app.features.feature1Description"] ||
                "Theo dõi tất cả tài sản cố định ở một nơi",
            icon: featureSettings["app.features.feature1Icon"],
        },
        {
            title: featureSettings["app.features.feature2Title"] || "Báo cáo thông minh",
            description:
                featureSettings["app.features.feature2Description"] ||
                "Tính khấu hao và báo cáo tự động",
            icon: featureSettings["app.features.feature2Icon"],
        },
        {
            title: featureSettings["app.features.feature3Title"] || "Bảo mật cao",
            description:
                featureSettings["app.features.feature3Description"] ||
                "Mã hóa dữ liệu và phân quyền chi tiết",
            icon: featureSettings["app.features.feature3Icon"],
        },
    ];

    const copyrightText =
        footerSettings["app.footer.copyright"] ||
        "© 2025 Fixed Asset Management. All rights reserved.";

    return (
        <div className="flex min-h-screen">
            {/* Left side - Branding */}
            <div className="hidden flex-1 flex-col items-center justify-between bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 p-12 lg:flex">
                {/* Logo */}
                <div className="flex-1" />
                <div className="flex flex-col items-center">
                    {(() => {
                        const raw = brandingSettings["app.branding.logo"];
                        const logoUrl = getMinioUrl(raw as string | undefined);
                        if (logoUrl) {
                            return (
                                <Image
                                    src={logoUrl}
                                    alt="FAM Logo"
                                    width={400}
                                    height={200}
                                    priority
                                    className="object-contain"
                                />
                            );
                        }
                        return (
                            <Image
                                src="/logo.png"
                                alt="FAM Logo"
                                width={400}
                                height={200}
                                priority
                                className="object-contain"
                            />
                        );
                    })()}
                </div>
                <div className="flex-1" />

                {/* Features */}
                <div className="space-y-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                            {feature.icon ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: feature.icon }}
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                    <svg
                                        className="h-5 w-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-white">{feature.title}</h3>
                                <p className="text-sm text-slate-300">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-sm text-slate-400">{copyrightText}</div>
            </div>

            {/* Right side - Form */}
            <div
                className="flex flex-1 flex-col items-center justify-center p-8"
                style={{ backgroundColor: "var(--colorBgLayout)" }}
            >
                {/* Language Switcher */}
                <div className="absolute right-8 top-8">
                    <LanguageSwitcher />
                </div>

                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
