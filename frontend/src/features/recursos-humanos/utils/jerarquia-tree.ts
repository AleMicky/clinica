import type { Area } from '../../catalogo-clinico/types/catalogo-clinico.types'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { JerarquiaAreaNode } from '../types/jerarquia.types'

export type JerarquiaNodeKind = 'area'
export type JerarquiaSelectionKind = JerarquiaNodeKind | null

export function nodeKey(kind: JerarquiaNodeKind, id: string) {
    return `${kind}:${id}`
}

export function parseNodeKey(key: string): { kind: JerarquiaNodeKind; id: string } | null {
    const [kind, id] = key.split(':')
    if (!id || kind !== 'area') {
        return null
    }
    return { kind, id }
}

export function toArea(node: JerarquiaAreaNode): Area {
    return {
        id: node.id,
        codigo: node.codigo,
        nombre: node.nombre,
        descripcion: node.descripcion || null,
    }
}

export function toBasePayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion?.trim() || '',
    }
}

function matchesQuery(value: string, query: string) {
    return value.toLowerCase().includes(query)
}

export function filterJerarquiaTree(
    areas: JerarquiaAreaNode[],
    query: string,
): JerarquiaAreaNode[] {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return areas

    return areas.filter(
        (area) =>
            matchesQuery(area.nombre, normalized) ||
            matchesQuery(area.codigo, normalized),
    )
}

export function formatEmpleados(count?: number | null) {
    if (count == null) return null
    return `${count} empleado${count === 1 ? '' : 's'}`
}
