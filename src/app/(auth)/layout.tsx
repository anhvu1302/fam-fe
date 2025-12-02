import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - Fixed Asset Management",
  description: "Đăng nhập vào hệ thống quản lý tài sản cố định",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden flex-1 flex-col items-center justify-between bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 p-12 lg:flex">
        {/* Logo */}
        <div className="flex-1" />
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="FAM Logo"
            width={400}
            height={200}
            priority
            className="object-contain"
          />
        </div>
        <div className="flex-1" />

        {/* Features */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
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
            <div>
              <h3 className="font-semibold text-white">Quản lý tập trung</h3>
              <p className="text-sm text-slate-300">
                Theo dõi tất cả tài sản cố định ở một nơi
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Báo cáo thông minh</h3>
              <p className="text-sm text-slate-300">
                Tính khấu hao và báo cáo tự động
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Bảo mật cao</h3>
              <p className="text-sm text-slate-300">
                Mã hóa dữ liệu và phân quyền chi tiết
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-slate-400">
          © 2025 Fixed Asset Management. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
