import {
    AppstoreOutlined,
    ColumnHeightOutlined,
    ControlOutlined,
    NumberOutlined,
} from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { useCatalogoGrupos } from '../catalogos/hooks/catalogo-grupos.hooks'
import { useCorrelativos } from '../correlativos/hooks/correlativos.hooks'
import { getParametrosActiveSection } from '../constants/parametros-sections'
import { useUnidadesMedida } from '../unidades-medida/hooks/unidades-medida.hooks'

export function ParametrosView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getParametrosActiveSection(pathname)

    const { data: gruposData, isFetching: loadingGrupos } = useCatalogoGrupos({
        page: 1,
        pageSize: 1,
    })
    const { data: unidadesData, isFetching: loadingUnidades } = useUnidadesMedida({
        page: 1,
        pageSize: 1,
    })
    const { data: correlativosData, isFetching: loadingCorrelativos } = useCorrelativos({
        page: 1,
        pageSize: 1,
    })

    const totalGrupos = gruposData?.totalRecords ?? 0
    const totalUnidades = unidadesData?.totalRecords ?? 0
    const totalCorrelativos = correlativosData?.totalRecords ?? 0

    return (
        <div className="parametros-module">
            <ModuleObjectPage
                icon={<ControlOutlined />}
                title="Parámetros"
                subtitle="Catálogos, unidades de medida y correlativos del sistema"
                stats={[
                    {
                        icon: <AppstoreOutlined />,
                        label: loadingGrupos ? '…' : `${totalGrupos} grupos`,
                    },
                    {
                        icon: <ColumnHeightOutlined />,
                        label: loadingUnidades ? '…' : `${totalUnidades} unidades`,
                    },
                    {
                        icon: <NumberOutlined />,
                        label: loadingCorrelativos
                            ? '…'
                            : `${totalCorrelativos} correlativos`,
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
        </div>
    )
}
