import {
    MutationCache,
    QueryCache,
    QueryClient,
} from "@tanstack/react-query";

type QueryOrMutation = { meta?: Record<string, unknown> | undefined };

function shouldSkip(meta: unknown): boolean {
    return Boolean(
        meta && typeof meta === "object" && (meta as QueryOrMutation).meta?.skipGlobalError,
    );
}

export function makeQueryClient(
    onError?: (error: unknown) => void,
): QueryClient {
    const queryCache = new QueryCache({
        onError: (error, query) => {
            if (shouldSkip(query.meta)) return;
            onError?.(error);
        },
    });

    const mutationCache = new MutationCache({
        onError: (error, _vars, _ctx, mutation) => {
            if (shouldSkip(mutation.meta)) return;
            onError?.(error);
        },
    });

    return new QueryClient({
        queryCache,
        mutationCache,
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}