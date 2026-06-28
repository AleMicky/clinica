import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { useRoles } from '../../roles/hooks/roles.hooks'
import { useUsers } from '../../usuarios/hooks/users.hooks'
import { getSeguridadActiveSection } from '../constants/seguridad-sections'

export function SeguridadView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getSeguridadActiveSection(pathname)

    const { data: usersData, isFetching: isLoadingUsers } = useUsers({
        page: 1,
        pageSize: 1,
    })
    const { data: rolesData, isFetching: isLoadingRoles } = useRoles({
        page: 1,
        pageSize: 1,
    })

    const totalUsers = usersData?.totalRecords ?? 0
    const totalRoles = rolesData?.totalRecords ?? 0

    return (
        <ModuleObjectPage
            icon={<SafetyCertificateOutlined />}
            title="Seguridad"
            subtitle="Usuarios, roles y control de acceso al sistema"
            stats={[
                {
                    icon: <TeamOutlined />,
                    label: isLoadingUsers ? '…' : `${totalUsers} usuarios`,
                },
                {
                    icon: <SafetyCertificateOutlined />,
                    label: isLoadingRoles ? '…' : `${totalRoles} roles`,
                },
            ]}
            activeSection={
                activeSection
                    ? { icon: activeSection.icon, title: activeSection.title }
                    : null
            }
        >
            <Outlet />
        </ModuleObjectPage>
    )
}
