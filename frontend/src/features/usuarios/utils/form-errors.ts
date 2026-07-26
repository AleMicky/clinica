export { getFieldError } from '../../../shared/utils/form-errors'

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
