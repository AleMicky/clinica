import { AppstoreOutlined } from '@ant-design/icons'

export type ParametrosPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

export const parametrosPageSections: ParametrosPageSection[] = [
    {
        path: '/parametros',
        title: 'Catálogos generales',
        icon: <AppstoreOutlined />,
    },
]

export function getParametrosActiveSection(
    pathname: string,
): ParametrosPageSection | null {
    return (
        parametrosPageSections.find(
            (section) =>
                pathname === section.path || pathname.startsWith(`${section.path}/`),
        ) ?? null
    )
}
