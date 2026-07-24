export function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

export function collectFieldErrors(
    issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
    const fieldErrors: Record<string, string> = {}

    for (const issue of issues) {
        const field = issue.path
            .filter((segment): segment is string | number => typeof segment !== 'symbol')
            .map(String)
            .filter(Boolean)
            .join('.')
        if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message
        }
    }

    return fieldErrors
}

export function applyFieldErrors(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: { setFieldMeta: (name: any, updater: (prev: any) => any) => void },
    fieldErrors: Record<string, string>,
) {
    for (const [fieldName, message] of Object.entries(fieldErrors)) {
        form.setFieldMeta(fieldName, (prev) => ({
            ...(prev ?? {}),
            isTouched: true,
            errorMap: {
                ...(prev?.errorMap ?? {}),
                onSubmit: message,
            },
            errors: [message],
        }))
    }
}
