/** Normaliza códigos de catálogo: mayúsculas y espacios → `_`. */
export function normalizeCodigoInput(value: string) {
    return value.toUpperCase().replace(/\s+/g, '_')
}
