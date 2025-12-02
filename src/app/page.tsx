import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div>{/* Trang dashboard trắng */}</div>
      </DashboardLayout>
    </AuthGuard>
  );
}
