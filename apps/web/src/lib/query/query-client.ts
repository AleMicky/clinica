import {
    MutationCache,
    QueryCache,
    QueryClient,
} from "@tanstack/react-query";


function shouldSkip(meta: unknown): boolean {
    if (!meta || typeof meta !== "object") return false;
    const m = meta as Record<string, unknown>;
    return Boolean(m.skipGlobalError || (m.meta as Record<string, unknown> | undefined)?.skipGlobalError);
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
                staleTime: 0,
                gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnMount: true,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}