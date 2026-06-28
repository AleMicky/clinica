import { AppstoreOutlined, ControlOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { useCatalogoGrupos } from '../catalogos/hooks/catalogo-grupos.hooks'
import { getParametrosActiveSection } from '../constants/parametros-sections'

export function ParametrosView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getParametrosActiveSection(pathname)

    const { data, isFetching } = useCatalogoGrupos({
        page: 1,
        pageSize: 1,
    })

    const totalGrupos = data?.totalRecords ?? 0

    return (
        <ModuleObjectPage
            icon={<ControlOutlined />}
            title="Parámetros"
            subtitle="Catálogos generales del sistema"
            stats={[
                {
                    icon: <AppstoreOutlined />,
                    label: isFetching ? '…' : `${totalGrupos} grupos de catálogo`,
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
