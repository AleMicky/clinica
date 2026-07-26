import {
    ExperimentOutlined,
    FileSearchOutlined,
    MedicineBoxOutlined,
} from '@ant-design/icons'

export type LaboratorioPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

export const laboratorioPageSections: LaboratorioPageSection[] = [
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
