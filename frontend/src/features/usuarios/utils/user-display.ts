import type { User } from '../types/user.types'

export function getUserInitials(name: string, userName: string) {
    const source = name.trim() || userName.trim()
    const parts = source.split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    }

    return source.slice(0, 2).toUpperCase()
}

export function formatOptionalDate(value?: string | null) {
    if (!value) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

export function formatPersonaDocumento(user: User) {
    const parts = [
        user.personaTipoDocumentoNombre,
        user.personaNumeroDocumento,
        user.personaExtensionDocumentoNombre,
        user.personaComplementoDocumento,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(' ') : null
}
