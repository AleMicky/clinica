import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
    ApartmentOutlined,
    AuditOutlined,
    ExperimentOutlined,
    IdcardOutlined,
    MedicineBoxOutlined,
    NodeIndexOutlined,
    UserOutlined,
} from '@ant-design/icons'

import type { CatalogoClinicoSection } from '../types/catalogo-clinico.types'

type CatalogoClinicoSidebarProps = {
    activeSection: CatalogoClinicoSection
    onSectionChange: (section: CatalogoClinicoSection) => void
    variant?: 'sidebar' | 'tabs'
}

type MenuItem = Required<MenuProps>['items'][number]

export const catalogoClinicoSections: {
    key: CatalogoClinicoSection
    label: string
    icon: React.ReactNode
    group: string
}[] = [
    { key: 'jerarquia', label: 'Áreas y servicios', icon: <NodeIndexOutlined />, group: 'Organización' },
    { key: 'especialidades', label: 'Especialidades', icon: <MedicineBoxOutlined />, group: 'RR.HH.' },
    { key: 'profesiones', label: 'Profesiones', icon: <UserOutlined />, group: 'RR.HH.' },
    { key: 'cargos', label: 'Cargos', icon: <IdcardOutlined />, group: 'RR.HH.' },
    { key: 'tipos-atencion', label: 'Tipos de atención', icon: <AuditOutlined />, group: 'Atención' },
]

const menuItems: MenuItem[] = [
    {
        type: 'group',
        label: 'Organización clínica',
        children: [
            {
                key: 'jerarquia',
                icon: <NodeIndexOutlined />,
                label: 'Áreas y servicios',
            },
        ],
    },
    {
        type: 'group',
        label: 'Recursos humanos',
        children: [
            {
                key: 'especialidades',
                icon: <MedicineBoxOutlined />,
                label: 'Especialidades',
            },
            {
                key: 'profesiones',
                icon: <UserOutlined />,
                label: 'Profesiones',
            },
            {
                key: 'cargos',
                icon: <IdcardOutlined />,
                label: 'Cargos',
            },
        ],
    },
    {
        type: 'group',
        label: 'Atención',
        children: [
            {
                key: 'tipos-atencion',
                icon: <AuditOutlined />,
                label: 'Tipos de atención',
            },
        ],
    },
]

const sectionMeta: Record<
    CatalogoClinicoSection,
    { title: string; description: string; icon: React.ReactNode }
> = {
    jerarquia: {
        title: 'Estructura organizacional',
        description: 'Áreas, departamentos, servicios y prestaciones médicas.',
        icon: <ApartmentOutlined />,
    },
    especialidades: {
        title: 'Especialidades médicas',
        description: 'Áreas de especialización del personal clínico.',
        icon: <MedicineBoxOutlined />,
    },
    profesiones: {
        title: 'Profesiones',
        description: 'Profesiones u oficios del personal de salud.',
        icon: <UserOutlined />,
    },
    cargos: {
        title: 'Cargos',
        description: 'Puestos y roles dentro de la institución.',
        icon: <IdcardOutlined />,
    },
    'tipos-atencion': {
        title: 'Tipos de atención',
        description: 'Clasificación de modalidades de atención clínica.',
        icon: <ExperimentOutlined />,
    },
}

export function CatalogoClinicoSidebar({
    activeSection,
    onSectionChange,
    variant = 'sidebar',
}: CatalogoClinicoSidebarProps) {
    if (variant === 'tabs') {
        return (
            <nav
                className="catalogo-clinico-tabs"
                aria-label="Secciones del catálogo clínico"
            >
                <div className="catalogo-clinico-tabs__scroll" role="tablist">
                    {catalogoClinicoSections.map((section) => {
                        const isActive = activeSection === section.key

                        return (
                            <button
                                key={section.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                className={[
                                    'catalogo-clinico-tabs__item',
                                    isActive ? 'catalogo-clinico-tabs__item--active' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => onSectionChange(section.key)}
                            >
                                <span className="catalogo-clinico-tabs__icon" aria-hidden>
                                    {section.icon}
                                </span>
                                <span className="catalogo-clinico-tabs__label">
                                    {section.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        )
    }

    return (
        <nav className="catalogo-clinico-sidebar" aria-label="Secciones del catálogo clínico">
            <Menu
                mode="inline"
                selectedKeys={[activeSection]}
                items={menuItems}
                onClick={({ key }) => onSectionChange(key as CatalogoClinicoSection)}
                className="catalogo-clinico-sidebar__menu"
            />
        </nav>
    )
}

export function getSectionMeta(section: CatalogoClinicoSection) {
    return sectionMeta[section]
}
