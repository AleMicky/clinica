import type { Area, Departamento, Servicio } from '../../catalogo-clinico/types/catalogo-clinico.types'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type {
    JerarquiaAreaNode,
    JerarquiaDepartamentoNode,
    JerarquiaServicioNode,
} from '../types/jerarquia.types'

export type JerarquiaNodeKind = 'area' | 'departamento' | 'servicio'
export type JerarquiaSelectionKind = JerarquiaNodeKind | null

export function nodeKey(kind: JerarquiaNodeKind, id: string) {
    return `${kind}:${id}`
}

export function parseNodeKey(key: string): { kind: JerarquiaNodeKind; id: string } | null {
    const [kind, id] = key.split(':')
    if (!id || (kind !== 'area' && kind !== 'departamento' && kind !== 'servicio')) {
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

export function toDepartamento(node: JerarquiaDepartamentoNode, areaNombre: string): Departamento {
    return {
        id: node.id,
        areaId: node.areaId,
        areaNombre,
        codigo: node.codigo,
        nombre: node.nombre,
        descripcion: node.descripcion || null,
    }
}

export function toServicio(node: JerarquiaServicioNode, departamentoNombre: string): Servicio {
    return {
        id: node.id,
        departamentoId: node.departamentoId,
        departamentoNombre,
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

    return areas
        .map((area) => {
            const areaMatch =
                matchesQuery(area.nombre, normalized) ||
                matchesQuery(area.codigo, normalized)

            const departamentos = area.departamentos
                .map((dept) => {
                    const deptMatch =
                        matchesQuery(dept.nombre, normalized) ||
                        matchesQuery(dept.codigo, normalized)

                    const servicios = dept.servicios.filter(
                        (servicio) =>
                            matchesQuery(servicio.nombre, normalized) ||
                            matchesQuery(servicio.codigo, normalized),
                    )

                    if (deptMatch) return dept
                    if (servicios.length > 0) return { ...dept, servicios }
                    return null
                })
                .filter((dept): dept is JerarquiaDepartamentoNode => dept !== null)

            if (areaMatch) return area
            if (departamentos.length > 0) return { ...area, departamentos }
            return null
        })
        .filter((area): area is JerarquiaAreaNode => area !== null)
}

export function collectExpandedKeys(areas: JerarquiaAreaNode[], query: string): string[] {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []

    const keys: string[] = []

    for (const area of areas) {
        let expandArea = false

        for (const dept of area.departamentos) {
            const deptMatch =
                matchesQuery(dept.nombre, normalized) ||
                matchesQuery(dept.codigo, normalized)
            const servicioMatch = dept.servicios.some(
                (servicio) =>
                    matchesQuery(servicio.nombre, normalized) ||
                    matchesQuery(servicio.codigo, normalized),
            )

            if (deptMatch || servicioMatch) {
                expandArea = true
                keys.push(nodeKey('departamento', dept.id))
            }
        }

        const areaMatch =
            matchesQuery(area.nombre, normalized) ||
            matchesQuery(area.codigo, normalized)

        if (expandArea || areaMatch) {
            keys.push(nodeKey('area', area.id))
        }
    }

    return keys
}

export function countAreaServicios(area: JerarquiaAreaNode) {
    return area.departamentos.reduce((total, dept) => total + dept.servicios.length, 0)
}

export function formatEmpleados(count?: number | null) {
    if (count == null) return null
    return `${count} empleado${count === 1 ? '' : 's'}`
}
