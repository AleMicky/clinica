import {
    ExperimentOutlined,
    IdcardOutlined,
    MedicineBoxOutlined,
    NodeIndexOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons'

export type RrhhPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

const rrhhPageSections: RrhhPageSection[] = [
    {
        path: '/recursos-humanos/empleados',
        title: 'Empleados',
        icon: <SolutionOutlined />,
    },
    {
        path: '/recursos-humanos/medicos',
        title: 'Médicos',
        icon: <MedicineBoxOutlined />,
    },
    {
        path: '/recursos-humanos/jerarquia',
        title: 'Áreas y servicios',
        icon: <NodeIndexOutlined />,
    },
    {
        path: '/recursos-humanos/especialidades',
        title: 'Especialidades',
        icon: <ExperimentOutlined />,
    },
    {
        path: '/recursos-humanos/profesiones',
        title: 'Profesiones',
        icon: <UserOutlined />,
    },
    {
        path: '/recursos-humanos/cargos',
        title: 'Cargos',
        icon: <IdcardOutlined />,
    },
]

export function getRrhhActiveSection(pathname: string): RrhhPageSection | null {
    return (
        rrhhPageSections.find(
            (section) =>
                pathname === section.path || pathname.startsWith(`${section.path}/`),
        ) ?? null
    )
}
