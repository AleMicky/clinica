export type FormFieldApi<T> = {
    state: {
        value: T
        meta: {
            errors: unknown[]
        }
    }
    handleChange: (value: T) => void
    handleBlur: () => void
}
