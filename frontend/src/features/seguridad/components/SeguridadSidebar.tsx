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
        icon: 'users',
        to: '/seguridad/usuarios',
    },
    {
        key: 'roles',
        label: 'Roles y permisos',
        description: 'Roles del sistema y su asignación a usuarios.',
        icon: 'roles',
        to: '/seguridad/roles',
    },
]

function SectionIcon({ type }: { type: SeguridadSectionMeta['icon'] }) {
    if (type === 'roles') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 12l8-4.5M12 12v9M12 12L4 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M16 8.5h5M18.5 6v5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function getActiveSeguridadSection(pathname: string): SeguridadSection {
    if (pathname.includes('/seguridad/roles')) return 'roles'
    return 'usuarios'
}

export function getSectionMeta(section: SeguridadSection): SeguridadSectionMeta {
    return seguridadSections.find((item) => item.key === section) ?? seguridadSections[0]
}

function NavItem({
    section,
    isActive,
    onNavigate,
    compact = false,
}: {
    section: SeguridadSectionMeta
    isActive: boolean
    onNavigate?: () => void
    compact?: boolean
}) {
    return (
        <Link
            to={section.to}
            className={[
                'erp-side-nav__item',
                isActive ? 'erp-side-nav__item--active' : '',
                compact ? 'erp-side-nav__item--compact' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
        >
            <span className="erp-side-nav__item-icon" aria-hidden>
                <SectionIcon type={section.icon} />
            </span>
            <span className="erp-side-nav__item-label">{section.label}</span>
        </Link>
    )
}

export function SeguridadSidebar({
    variant = 'sidebar',
    onNavigate,
}: SeguridadSidebarProps) {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getActiveSeguridadSection(pathname)

    if (variant === 'tabs') {
        return (
            <nav className="erp-side-nav erp-side-nav--tabs" aria-label="Secciones de seguridad">
                <div className="erp-side-nav__tabs-scroll">
                    {seguridadSections.map((section) => (
                        <NavItem
                            key={section.key}
                            section={section}
                            isActive={activeSection === section.key}
                            onNavigate={onNavigate}
                            compact
                        />
                    ))}
                </div>
            </nav>
        )
    }

    return (
        <nav className="erp-side-nav" aria-label="Secciones de seguridad">
            <p className="erp-side-nav__eyebrow">Gestión de acceso</p>
            <div className="erp-side-nav__list">
                {seguridadSections.map((section) => (
                    <NavItem
                        key={section.key}
                        section={section}
                        isActive={activeSection === section.key}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </nav>
    )
}
