import { ExperimentOutlined, FileSearchOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { getLaboratorioActiveSection } from '../constants/laboratorio-sections'
import { useEspecialidadesLab } from '../especialidades/hooks/especialidades.hooks'
import { useTiposExamen } from '../tipos-examen/hooks/tipos-examen.hooks'

export function LaboratorioView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getLaboratorioActiveSection(pathname)

    const { data: especialidadesData, isFetching: loadingEspecialidades } =
        useEspecialidadesLab({
            page: 1,
            pageSize: 1,
        })
    const { data: tiposExamenData, isFetching: loadingTiposExamen } = useTiposExamen({
        page: 1,
        pageSize: 1,
    })

    const totalEspecialidades = especialidadesData?.totalRecords ?? 0
    const totalTiposExamen = tiposExamenData?.totalRecords ?? 0

    return (
        <div className="laboratorio-module">
            <ModuleObjectPage
                icon={<ExperimentOutlined />}
                title="Laboratorio"
                subtitle="Especialidades y tipos de examen del laboratorio clínico"
                stats={[
                    {
                        icon: <ExperimentOutlined />,
                        label: loadingEspecialidades
                            ? '…'
                            : `${totalEspecialidades} especialidades`,
                    },
                    {
                        icon: <FileSearchOutlined />,
                        label: loadingTiposExamen
                            ? '…'
                            : `${totalTiposExamen} tipos de examen`,
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
