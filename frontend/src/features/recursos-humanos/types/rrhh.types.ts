import type { FileRouteTypes } from '../../../routeTree.gen'

type AppRoute = FileRouteTypes['to']

export type RrhhSection = 'empleados' | 'medicos'

export type RrhhSectionMeta = {
    key: RrhhSection
    label: string
    description: string
    icon: 'empleados' | 'medicos'
    to: AppRoute
}
