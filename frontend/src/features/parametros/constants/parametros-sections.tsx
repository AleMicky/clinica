import {
    AppstoreOutlined,
    ColumnHeightOutlined,
    NumberOutlined,
} from '@ant-design/icons'

export type ParametrosPageSection = {
    path: string
    title: string
    icon: React.ReactNode
}

export const parametrosPageSections: ParametrosPageSection[] = [
    {
        path: '/parametros/catalogos',
        title: 'Catálogos generales',
        icon: <AppstoreOutlined />,
    },
    {
        path: '/parametros/unidades-medida',
        title: 'Unidades de medida',
        icon: <ColumnHeightOutlined />,
    },
    {
        path: '/parametros/correlativos',
        title: 'Correlativos',
        icon: <NumberOutlined />,
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
