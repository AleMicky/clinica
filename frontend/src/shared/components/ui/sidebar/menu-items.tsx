import type { MenuProps } from 'antd'
import type { FileRouteTypes } from '../../../../routeTree.gen'
import {
    AppstoreOutlined,
    DashboardOutlined,
    ExperimentOutlined,
    IdcardOutlined,
    MedicineBoxOutlined,
    NodeIndexOutlined,
    SafetyCertificateOutlined,
    ControlOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { AppRole, canAccessRoles, type AppRoleName } from '../../../constants/app-roles'

type AppRoute = FileRouteTypes['to']

export type AppMenuItem = {
    key: string
    label: string
    icon: React.ReactNode
    /** Ruta de navegación. Si no existe, el ítem se muestra deshabilitado. */
    to?: AppRoute
    roles?: AppRoleName[]
    disabled?: boolean
}

export type MenuGroup = {
    key: string
    label: string
    roles?: AppRoleName[]
    items: AppMenuItem[]
}

export const menuGroups: MenuGroup[] = [
    {
        key: 'general',
        label: 'General',
        items: [
            {
                key: '/',
                to: '/',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
        ],
    },
    {
        key: 'clinical',
        label: 'Clínica',
        roles: [AppRole.Admin, AppRole.Medico, AppRole.Recepcion],
        items: [
            {
                key: '/pacientes',
                to: '/pacientes',
                icon: <TeamOutlined />,
                label: 'Pacientes',
                roles: [AppRole.Admin, AppRole.Medico, AppRole.Recepcion],
            },
            {
                key: '/atenciones',
                to: '/atenciones',
                icon: <MedicineBoxOutlined />,
                label: 'Atenciones',
                roles: [AppRole.Admin, AppRole.Medico, AppRole.Recepcion],
            },
        ],
    },
    {
        key: 'seguridad',
        label: 'Seguridad',
        roles: [AppRole.Admin],
        items: [
            {
                key: '/seguridad/usuarios',
                to: '/seguridad/usuarios',
                icon: <UserOutlined />,
                label: 'Usuarios',
                roles: [AppRole.Admin],
            },
            {
                key: '/seguridad/roles',
                to: '/seguridad/roles',
                icon: <SafetyCertificateOutlined />,
                label: 'Roles y permisos',
                roles: [AppRole.Admin],
            },
        ],
    },
    {
        key: 'rrhh',
        label: 'Recursos Humanos',
        roles: [AppRole.Admin],
        items: [
            {
                key: '/recursos-humanos/empleados',
                to: '/recursos-humanos/empleados',
                icon: <SolutionOutlined />,
                label: 'Empleados',
                roles: [AppRole.Admin],
            },
            {
                key: '/recursos-humanos/medicos',
                to: '/recursos-humanos/medicos',
                icon: <MedicineBoxOutlined />,
                label: 'Médicos',
                roles: [AppRole.Admin],
            },
            {
                key: '/recursos-humanos/jerarquia',
                to: '/recursos-humanos/jerarquia',
                icon: <NodeIndexOutlined />,
                label: 'Áreas y servicios',
                roles: [AppRole.Admin],
            },
            {
                key: '/recursos-humanos/especialidades',
                to: '/recursos-humanos/especialidades',
                icon: <ExperimentOutlined />,
                label: 'Especialidades',
                roles: [AppRole.Admin],
            },
            {
                key: '/recursos-humanos/profesiones',
                to: '/recursos-humanos/profesiones',
                icon: <UserOutlined />,
                label: 'Profesiones',
                roles: [AppRole.Admin],
            },
            {
                key: '/recursos-humanos/cargos',
                to: '/recursos-humanos/cargos',
                icon: <IdcardOutlined />,
                label: 'Cargos',
                roles: [AppRole.Admin],
            },
        ],
    },
    {
        key: 'configuration',
        label: 'Configuración',
        roles: [AppRole.Admin],
        items: [
            {
                key: '/parametros',
                icon: <ControlOutlined />,
                label: 'Parámetros',
                roles: [AppRole.Admin],
            },
            {
                key: '/catalogos',
                to: '/catalogos',
                icon: <AppstoreOutlined />,
                label: 'Catálogos generales',
                roles: [AppRole.Admin],
            },
        ],
    },
]

export function filterMenuGroups(
    groups: MenuGroup[],
    userRoles: string[] = [],
): MenuGroup[] {
    return groups
        .filter((group) => canAccessRoles(userRoles, group.roles))
        .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                canAccessRoles(userRoles, item.roles),
            ),
        }))
        .filter((group) => group.items.length > 0)
}

export function getMenuGroupsForUser(userRoles: string[] = []): MenuGroup[] {
    return filterMenuGroups(menuGroups, userRoles)
}

type AntMenuItemEntry = {
    key: string
    icon: React.ReactNode
    label: string
    disabled: boolean
    title: string
}

function toAntMenuItem(item: AppMenuItem): AntMenuItemEntry {
    const isDisabled = item.disabled ?? !item.to

    return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        disabled: isDisabled,
        title: isDisabled ? `${item.label} (próximamente)` : item.label,
    }
}

export function buildMenuItems(userRoles: string[] = []): MenuProps['items'] {
    return getMenuGroupsForUser(userRoles).map((group) => ({
        type: 'group' as const,
        label: group.label,
        children: group.items.map(toAntMenuItem),
    }))
}

export function buildFlatMenuItems(userRoles: string[] = []): MenuProps['items'] {
    const groups = getMenuGroupsForUser(userRoles)

    return groups.flatMap((group, index) => {
        const items = group.items.map(toAntMenuItem)

        if (index === 0) {
            return items
        }

        return [{ type: 'divider' as const, key: `divider-${group.key}` }, ...items]
    })
}

export function getSelectedMenuKey(
    pathname: string,
    userRoles: string[] = [],
): string {
    const items = getMenuGroupsForUser(userRoles).flatMap((group) => group.items)

    const match = items
        .filter(
            (item) =>
                item.to &&
                (pathname === item.to || pathname.startsWith(`${item.to}/`)),
        )
        .sort((a, b) => (b.to?.length ?? 0) - (a.to?.length ?? 0))[0]

    if (match) return match.key

    return pathname === '/' ? '/' : pathname
}

export function getMenuBreadcrumb(
    pathname: string,
    userRoles: string[] = [],
): { group?: string; page: string } {
    for (const group of getMenuGroupsForUser(userRoles)) {
        for (const item of group.items) {
            if (
                item.to &&
                (pathname === item.to || pathname.startsWith(`${item.to}/`))
            ) {
                return { group: group.label, page: item.label }
            }
        }
    }

    if (pathname === '/') {
        return { page: 'Dashboard' }
    }

    return { page: 'Panel' }
}

export type BreadcrumbSegment = {
    title: string
    to?: AppRoute
}

const nestedRouteLabels: Record<string, { title: string; parentPath: AppRoute }> = {
    '/usuarios/perfil': { title: 'Mi perfil', parentPath: '/seguridad/usuarios' },
    '/atenciones/$atencionId': { title: 'Detalle de atención', parentPath: '/atenciones' },
}

function findMenuItemByPath(
    pathname: string,
    userRoles: string[] = [],
): { group?: MenuGroup; item?: AppMenuItem } {
    for (const group of getMenuGroupsForUser(userRoles)) {
        for (const item of group.items) {
            if (
                item.to &&
                (pathname === item.to || pathname.startsWith(`${item.to}/`))
            ) {
                return { group, item }
            }
        }
    }

    return {}
}

export function getBreadcrumbSegments(
    pathname: string,
    userRoles: string[] = [],
): BreadcrumbSegment[] {
    const segments: BreadcrumbSegment[] = [
        { title: 'Clínica ERP', to: '/' },
    ]

    const nested = nestedRouteLabels[pathname]
    if (nested) {
        const parent = findMenuItemByPath(nested.parentPath, userRoles)

        if (parent.group && parent.group.key !== 'general') {
            segments.push({ title: parent.group.label })
        }

        if (parent.item) {
            segments.push({ title: parent.item.label, to: nested.parentPath })
        }

        segments.push({ title: nested.title })
        return segments
    }

    if (pathname.startsWith('/atenciones/') && pathname !== '/atenciones') {
        const parent = findMenuItemByPath('/atenciones', userRoles)

        if (parent.group && parent.group.key !== 'general') {
            segments.push({ title: parent.group.label })
        }

        if (parent.item) {
            segments.push({ title: parent.item.label, to: '/atenciones' })
        }

        segments.push({ title: 'Detalle de atención' })
        return segments
    }

    const { group, item } = findMenuItemByPath(pathname, userRoles)

    if (group && group.key !== 'general') {
        segments.push({ title: group.label })
    }

    if (item) {
        segments.push({ title: item.label, to: item.to })
        return segments
    }

    const fallback = getMenuBreadcrumb(pathname, userRoles)

    if (fallback.group && pathname !== '/') {
        segments.push({ title: fallback.group })
    }

    segments.push({ title: fallback.page })

    return segments
}

export function findMenuItemByKey(
    key: string,
    userRoles: string[] = [],
): AppMenuItem | undefined {
    return getMenuGroupsForUser(userRoles)
        .flatMap((group) => group.items)
        .find((item) => item.key === key)
}
