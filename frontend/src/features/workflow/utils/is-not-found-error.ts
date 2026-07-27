import { AxiosError } from 'axios'

export function isNotFoundError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 404
}
