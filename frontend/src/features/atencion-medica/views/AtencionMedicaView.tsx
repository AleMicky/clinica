import { FormOutlined, MedicineBoxOutlined } from '@ant-design/icons'
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

    const isFormularios =
        pathname === '/atenciones/formularios' ||
        pathname.startsWith('/atenciones/formularios/')

    if (isFormularios) {
        return (
            <div className="atencion-medica-module">
                <ModuleObjectPage
                    icon={<FormOutlined />}
                    title="Formularios clínicos"
                    subtitle="Configure los formularios, secciones, campos y validaciones del tipo de atención seleccionado."
                >
                    <Outlet />
                </ModuleObjectPage>
            </div>
        )
    }

    return (
        <div className="atencion-medica-module">
            <ModuleObjectPage
                icon={<MedicineBoxOutlined />}
                title="Atención médica"
                subtitle="Atenciones clínicas, tipos y formularios asociados."
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
        </div>
    )
}
