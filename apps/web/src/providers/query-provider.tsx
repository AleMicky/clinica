"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { makeQueryClient } from "@/lib/query/query-client";
import { getApiErrorInfo, type ApiErrorInfo } from "@/lib/api/api-error";
import { GlobalApiErrorAlertDialog } from "@/components/shared";

type QueryProviderProps = {
    children: ReactNode;
};

export function QueryProvider({
    children,
}: QueryProviderProps) {
    const [apiError, setApiError] = useState<ApiErrorInfo | null>(null);

    const [queryClient] = useState(() =>
        makeQueryClient((error) => setApiError(getApiErrorInfo(error))),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <GlobalApiErrorAlertDialog
                error={apiError}
                onOpenChange={(open) => {
                    if (!open) setApiError(null);
                }}
            />

            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}