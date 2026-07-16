import { FormOutlined, MedicineBoxOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import {
    getAtencionMedicaActiveSection,
    isAtencionDetailPath,
} from '../constants/atencion-medica-sections'
import { useAtenciones } from '../hooks/atencion-medica.hooks'

function getPageHeader(pathname: string): {
    title: string
    subtitle: string
    icon: React.ReactNode
} {
    if (
        pathname === '/atenciones/formularios' ||
        pathname.startsWith('/atenciones/formularios/')
    ) {
        return {
            icon: <FormOutlined />,
            title: 'Formularios clínicos',
            subtitle:
                'Configure los formularios, secciones, campos y validaciones del tipo de atención seleccionado.',
        }
    }

    if (pathname === '/atenciones/tipos-atencion') {
        return {
            icon: <UnorderedListOutlined />,
            title: 'Tipos de atención',
            subtitle: 'Administre los tipos de atención clínica y sus formularios asociados.',
        }
    }

    return {
        icon: <MedicineBoxOutlined />,
        title: 'Atención médica',
        subtitle: 'Atenciones clínicas, formularios y catálogos diagnósticos',
    }
}

export function AtencionMedicaView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getAtencionMedicaActiveSection(pathname)
    const header = getPageHeader(pathname)

    const { data: atencionesData, isFetching } = useAtenciones({ page: 1, pageSize: 1 })
    const totalAtenciones = atencionesData?.totalRecords ?? 0

    if (isAtencionDetailPath(pathname)) {
        return <Outlet />
    }

    const isConfigSection =
        pathname === '/atenciones/tipos-atencion' ||
        pathname === '/atenciones/formularios' ||
        pathname.startsWith('/atenciones/formularios/')

    return (
        <ModuleObjectPage
            icon={header.icon}
            title={header.title}
            subtitle={header.subtitle}
            stats={
                isConfigSection
                    ? undefined
                    : [
                          {
                              icon: <MedicineBoxOutlined />,
                              label: isFetching ? '…' : `${totalAtenciones} atenciones`,
                          },
                      ]
            }
            activeSection={
                activeSection && !isConfigSection
                    ? { icon: activeSection.icon, title: activeSection.title }
                    : null
            }
        >
            <Outlet />
        </ModuleObjectPage>
    )
}
