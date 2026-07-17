import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'

export type SeguridadPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

const seguridadPageSections: SeguridadPageSection[] = [
    {
        path: '/seguridad/usuarios',
        title: 'Usuarios',
        icon: <UserOutlined />,
    },
    {
        path: '/seguridad/roles',
        title: 'Roles y permisos',
        icon: <SafetyCertificateOutlined />,
    },
]

export function getSeguridadActiveSection(pathname: string): SeguridadPageSection | null {
    return (
        seguridadPageSections.find(
            (section) =>
                pathname === section.path || pathname.startsWith(`${section.path}/`),
        ) ?? null
    )
}
