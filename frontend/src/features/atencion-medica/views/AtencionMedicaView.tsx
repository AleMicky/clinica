import { MedicineBoxOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import {
    getAtencionMedicaActiveSection,
    isAtencionDetailPath,
} from '../constants/atencion-medica-sections'
import { useAtenciones } from '../hooks/atencion-medica.hooks'

export function AtencionMedicaView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getAtencionMedicaActiveSection(pathname)

    const { data: atencionesData, isFetching } = useAtenciones({ page: 1, pageSize: 1 })
    const totalAtenciones = atencionesData?.totalRecords ?? 0

    if (isAtencionDetailPath(pathname)) {
        return <Outlet />
    }

    return (
        <ModuleObjectPage
            icon={<MedicineBoxOutlined />}
            title="Atención médica"
            subtitle="Atenciones clínicas, formularios y catálogos diagnósticos"
            stats={[
                {
                    icon: <MedicineBoxOutlined />,
                    label: isFetching ? '…' : `${totalAtenciones} atenciones`,
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
