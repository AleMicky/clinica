import { MedicineBoxOutlined, SolutionOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { getRrhhActiveSection } from '../constants/rrhh-sections'
import { useEmpleados } from '../hooks/empleados.hooks'
import { useMedicos } from '../hooks/medicos.hooks'

export function RecursosHumanosView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getRrhhActiveSection(pathname)

    const { data: empleadosData, isFetching: loadingEmpleados } = useEmpleados({
        page: 1,
        pageSize: 1,
    })
    const { data: medicosData, isFetching: loadingMedicos } = useMedicos({
        page: 1,
        pageSize: 1,
    })

    const totalEmpleados = empleadosData?.totalRecords ?? 0
    const totalMedicos = medicosData?.totalRecords ?? 0

    return (
        <div className="rrhh-module">
            <ModuleObjectPage
                icon={<SolutionOutlined />}
                title="Recursos Humanos"
                subtitle="Personal, estructura organizacional y catálogos del hospital"
                stats={[
                    {
                        icon: <SolutionOutlined />,
                        label: loadingEmpleados ? '…' : `${totalEmpleados} empleados`,
                    },
                    {
                        icon: <MedicineBoxOutlined />,
                        label: loadingMedicos ? '…' : `${totalMedicos} médicos`,
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
