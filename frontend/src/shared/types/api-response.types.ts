export type ApiErrorItem = {
    campo?: string;
    mensaje?: string;
};

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | ApiErrorItem[] | null;
    timestamp: string;
};