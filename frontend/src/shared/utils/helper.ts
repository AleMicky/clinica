import type { ApiResponse } from "../types/api-response.types";

export function unwrap<T>(
    response: ApiResponse<T>,
): T {
    return response.data
}