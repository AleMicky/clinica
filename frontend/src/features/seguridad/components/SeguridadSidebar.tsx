import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useRouterState } from '@tanstack/react-router'

import type { SeguridadSection, SeguridadSectionMeta } from '../types/seguridad.types'

type SeguridadSidebarProps = {
    variant?: 'sidebar' | 'tabs'
    onNavigate?: () => void
}

export const seguridadSections: SeguridadSectionMeta[] = [
    {
        key: 'usuarios',
        label: 'Usuarios',
        description: 'Cuentas de acceso y credenciales del sistema.',
        icon: <UserOutlined />,
        to: '/seguridad/usuarios',
    },
    {
        key: 'roles',
        label: 'Roles y permisos',
        description: 'Roles del sistema y su asignación a usuarios.',
        icon: <SafetyCertificateOutlined />,
        to: '/seguridad/roles',
    },
]

const menuItems: MenuProps['items'] = [
    {
        type: 'group',
        label: 'Gestión de acceso',
        children: seguridadSections.map((section) => ({
            key: section.key,
            icon: section.icon,
            label: (
                <Link to={section.to} className="seguridad-sidebar__menu-link">
                    {section.label}
                </Link>
            ),
        })),
    },
]

export function getActiveSeguridadSection(pathname: string): SeguridadSection {
    if (pathname.includes('/seguridad/roles')) return 'roles'
    return 'usuarios'
}

export function getSectionMeta(section: SeguridadSection): SeguridadSectionMeta {
    return seguridadSections.find((item) => item.key === section) ?? seguridadSections[0]
}

export function SeguridadSidebar({
    variant = 'sidebar',
    onNavigate,
}: SeguridadSidebarProps) {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getActiveSeguridadSection(pathname)

    if (variant === 'tabs') {
        return (
            <nav className="seguridad-tabs" aria-label="Secciones de seguridad">
                <div className="seguridad-tabs__scroll" role="tablist">
                    {seguridadSections.map((section) => {
                        const isActive = activeSection === section.key

                        return (
                            <Link
                                key={section.key}
                                to={section.to}
                                role="tab"
                                aria-selected={isActive}
                                className={[
                                    'seguridad-tabs__item',
                                    isActive ? 'seguridad-tabs__item--active' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={onNavigate}
                            >
                                <span className="seguridad-tabs__icon" aria-hidden>
                                    {section.icon}
                                </span>
                                <span className="seguridad-tabs__label">
                                    {section.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        )
    }

    return (
        <nav className="seguridad-sidebar" aria-label="Secciones de seguridad">
            <Menu
                mode="inline"
                selectedKeys={[activeSection]}
                items={menuItems}
                className="seguridad-sidebar__menu"
                onClick={onNavigate}
            />
        </nav>
    )
}
