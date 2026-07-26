type CodigoNombreDescripcion = {
    codigo: string
    nombre: string
    descripcion?: string | null
}

export function matchesCodigoNombreDescripcion(
    item: CodigoNombreDescripcion,
    search: string,
) {
    const term = search.trim().toLowerCase()
    if (!term) return true

    return (
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term) ||
        (item.descripcion?.toLowerCase() ?? '').includes(term)
    )
}

export function formatRegistrosCaption(
    total: number,
    hasActiveFilters: boolean,
) {
    return `${total} registrado${total === 1 ? '' : 's'}${
        hasActiveFilters ? ' · filtros activos' : ''
    }`
}
