import {
    AppstoreOutlined,
    ColumnHeightOutlined,
    ControlOutlined,
    IdcardOutlined,
    NumberOutlined,
} from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { usePersonas } from '../../personas/hooks/personas.hooks'
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
    const { data: personasData, isFetching: loadingPersonas } = usePersonas({
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
    const totalPersonas = personasData?.totalRecords ?? 0
    const totalUnidades = unidadesData?.totalRecords ?? 0
    const totalCorrelativos = correlativosData?.totalRecords ?? 0

    return (
        <div className="parametros-module">
            <ModuleObjectPage
                icon={<ControlOutlined />}
                title="Parámetros"
                subtitle="Catálogos, personas, unidades de medida y correlativos del sistema"
                stats={[
                    {
                        icon: <AppstoreOutlined />,
                        label: loadingGrupos ? '…' : `${totalGrupos} grupos`,
                    },
                    {
                        icon: <IdcardOutlined />,
                        label: loadingPersonas ? '…' : `${totalPersonas} personas`,
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
