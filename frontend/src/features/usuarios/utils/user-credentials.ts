function slugifyUserName(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '')
        .replace(/\.{2,}/g, '.')
}

export function generateSuggestedUserName(values: {
    numeroDocumento?: string
    nombres?: string
    apellidoPaterno?: string
}) {
    const documento = values.numeroDocumento?.trim()
    if (documento) return documento

    const nombres = values.nombres?.trim()
    const apellido = values.apellidoPaterno?.trim()

    if (nombres && apellido) {
        const firstName = nombres.split(/\s+/)[0] ?? nombres
        return slugifyUserName(`${apellido}.${firstName}`)
    }

    return ''
}

export function generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join('')
}
