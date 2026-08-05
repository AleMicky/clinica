import type { ReactNode } from "react";

import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <AuthGuard>
            <DashboardLayoutWrapper>
                {children}
            </DashboardLayoutWrapper>
        </AuthGuard>
    );
}