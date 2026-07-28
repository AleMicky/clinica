export function getFieldError(errors: unknown[]) {
    return errors
        .map((error) => {
            if (typeof error === 'string') return error
            if (error && typeof error === 'object' && 'message' in error) {
                const message = (error as { message: unknown }).message
                return typeof message === 'string' ? message : undefined
            }
            return undefined
        })
        .filter((message): message is string => Boolean(message))
        .join(', ')
}
