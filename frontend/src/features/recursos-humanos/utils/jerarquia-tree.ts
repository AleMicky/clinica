import type {
    Area,
    CreateAreaPayload,
} from '../../catalogo-clinico/types/catalogo-clinico.types'
import type { AreaFormValues } from '../schemas/area.schema'
import type { JerarquiaAreaNode } from '../types/jerarquia.types'

export type JerarquiaNodeKind = 'area'
export type JerarquiaSelectionKind = JerarquiaNodeKind | null

export type JerarquiaTreeNode = JerarquiaAreaNode & {
    children: JerarquiaTreeNode[]
}

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
        tipoAreaId: node.tipoAreaId,
        tipoAreaNombre: node.tipoAreaNombre,
        areaPadreId: node.areaPadreId ?? null,
        areaPadreNombre: null,
        responsableEmpleadoId: node.responsableEmpleadoId ?? null,
    }
}

export function toAreaPayload(values: AreaFormValues): CreateAreaPayload {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion?.trim() || '',
        tipoAreaId: values.tipoAreaId,
        areaPadreId: values.areaPadreId?.trim() || null,
        responsableEmpleadoId: values.responsableEmpleadoId?.trim() || null,
    }
}

function matchesQuery(value: string, query: string) {
    return value.toLowerCase().includes(query)
}

export function buildJerarquiaTree(areas: JerarquiaAreaNode[]): JerarquiaTreeNode[] {
    const nodes = new Map<string, JerarquiaTreeNode>()

    for (const area of areas) {
        nodes.set(area.id, { ...area, children: [] })
    }

    const roots: JerarquiaTreeNode[] = []

    for (const node of nodes.values()) {
        const parentId = node.areaPadreId
        if (parentId && nodes.has(parentId)) {
            nodes.get(parentId)!.children.push(node)
            continue
        }
        roots.push(node)
    }

    const sortNodes = (list: JerarquiaTreeNode[]) => {
        list.sort((a, b) => {
            if (a.tipoAreaOrden !== b.tipoAreaOrden) {
                return a.tipoAreaOrden - b.tipoAreaOrden
            }
            return a.nombre.localeCompare(b.nombre, 'es')
        })
        for (const item of list) {
            sortNodes(item.children)
        }
    }

    sortNodes(roots)
    return roots
}

export function filterJerarquiaTree(
    areas: JerarquiaAreaNode[],
    query: string,
): JerarquiaTreeNode[] {
    const tree = buildJerarquiaTree(areas)
    const normalized = query.trim().toLowerCase()
    if (!normalized) return tree

    const filterNode = (node: JerarquiaTreeNode): JerarquiaTreeNode | null => {
        const children = node.children
            .map(filterNode)
            .filter((child): child is JerarquiaTreeNode => child !== null)

        const matches =
            matchesQuery(node.nombre, normalized) ||
            matchesQuery(node.codigo, normalized) ||
            matchesQuery(node.tipoAreaNombre, normalized)

        if (!matches && children.length === 0) {
            return null
        }

        return { ...node, children }
    }

    return tree
        .map(filterNode)
        .filter((node): node is JerarquiaTreeNode => node !== null)
}

export function formatEmpleados(count?: number | null) {
    if (count == null) return null
    return `${count} empleado${count === 1 ? '' : 's'}`
}

/** Claves de nodos con hijos (para expandir el árbol de Ant Design). */
export function collectExpandableKeys(nodes: JerarquiaTreeNode[]): string[] {
    const keys: string[] = []

    const visit = (list: JerarquiaTreeNode[]) => {
        for (const node of list) {
            if (node.children.length > 0) {
                keys.push(nodeKey('area', node.id))
                visit(node.children)
            }
        }
    }

    visit(nodes)
    return keys
}
