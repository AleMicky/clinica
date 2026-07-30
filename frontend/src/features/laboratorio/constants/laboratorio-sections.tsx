import {
    ExperimentOutlined,
    FileDoneOutlined,
    FileSearchOutlined,
    MedicineBoxOutlined,
    OrderedListOutlined,
    SolutionOutlined,
} from '@ant-design/icons'

export type LaboratorioPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

export const laboratorioPageSections: LaboratorioPageSection[] = [
    {
        path: '/laboratorio/solicitudes',
        title: 'Solicitudes',
        icon: <SolutionOutlined />,
    },
    {
        path: '/laboratorio/muestras',
        title: 'Muestras',
        icon: <OrderedListOutlined />,
    },
    {
        path: '/laboratorio/resultados',
        title: 'Resultados',
        icon: <FileDoneOutlined />,
    },
    {
        path: '/laboratorio/especialidades',
        title: 'Especialidades',
        icon: <ExperimentOutlined />,
    },
    {
        path: '/laboratorio/tipos-examen',
        title: 'Tipos de examen',
        icon: <FileSearchOutlined />,
    },
    {
        path: '/laboratorio/pruebas',
        title: 'Pruebas',
        icon: <MedicineBoxOutlined />,
    },
    {
        path: '/laboratorio/parametros',
        title: 'Parámetros',
        icon: <OrderedListOutlined />,
    },
]

export function getLaboratorioActiveSection(
    pathname: string,
): LaboratorioPageSection | null {
    return (
        laboratorioPageSections.find(
            (section) =>
                pathname === section.path || pathname.startsWith(`${section.path}/`),
        ) ?? null
    )
}

export function isSolicitudDetailPath(pathname: string): boolean {
    return /\/laboratorio\/solicitudes\/[0-9a-f-]{36}$/i.test(pathname)
}
