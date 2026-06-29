import {
    ExperimentOutlined,
    FileTextOutlined,
    FormOutlined,
    MedicineBoxOutlined,
    SolutionOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'

export type AtencionMedicaPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

export const atencionMedicaPageSections: AtencionMedicaPageSection[] = [
    {
        path: '/atenciones',
        title: 'Atenciones',
        icon: <MedicineBoxOutlined />,
    },
    {
        path: '/atencion-medica/recepcion',
        title: 'Recepción',
        icon: <SolutionOutlined />,
    },
    {
        path: '/atencion-medica/enfermeria',
        title: 'Enfermería',
        icon: <ExperimentOutlined />,
    },
    {
        path: '/atencion-medica/consulta-medica',
        title: 'Consulta médica',
        icon: <MedicineBoxOutlined />,
    },
    {
        path: '/atenciones/tipos-atencion',
        title: 'Tipos de atención',
        icon: <UnorderedListOutlined />,
    },
    {
        path: '/atenciones/formularios',
        title: 'Formularios clínicos',
        icon: <FormOutlined />,
    },
    {
        path: '/atenciones/diagnosticos',
        title: 'Diagnósticos CIE-10',
        icon: <FileTextOutlined />,
    },
]

export function getAtencionMedicaActiveSection(
    pathname: string,
): AtencionMedicaPageSection | null {
    if (pathname === '/atenciones' || pathname === '/atenciones/') {
        return atencionMedicaPageSections[0]
    }

    return (
        atencionMedicaPageSections.find(
            (section) =>
                section.path !== '/atenciones' &&
                (pathname === section.path || pathname.startsWith(`${section.path}/`)),
        ) ?? null
    )
}

export function isAtencionDetailPath(pathname: string): boolean {
    return /\/atenciones\/[0-9a-f-]{36}$/i.test(pathname)
}
