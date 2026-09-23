import React, { ReactNode, Suspense } from "react";
import AdminProvider from "@/components/admin/AdminProvider";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin Panel - Misiku Refine Citadel",
  description: "Kelola semua data petualangan, quest, pengguna, kategori, dan lencana Misiku.",
};

export default function RootAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090b10] text-[#f4ebd0] flex items-center justify-center font-cinzel">
          Memuat Citadel...
        </div>
      }
    >
      <AdminProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminProvider>
    </Suspense>
  );
}
