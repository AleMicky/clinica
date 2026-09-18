import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { AuthGuard } from "@/modules/auth/components/auth-guard";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    return (
        <AuthGuard>
            <DashboardLayoutWrapper defaultOpen={defaultOpen}>
                {children}
            </DashboardLayoutWrapper>
        </AuthGuard>
    );
}