export function formatDateTime(value?: string | null) {
    if (!value) return '—'

    return new Date(value).toLocaleString('es-BO', {
        dateStyle: 'short',
        timeStyle: 'short',
    })
}

export function formatDate(value?: string | null) {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('es-BO')
}

export function toDatetimeLocalValue(value?: string | null) {
    if (!value) return new Date().toISOString().slice(0, 16)

    return value.slice(0, 16)
}
