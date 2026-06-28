import { RightOutlined } from '@ant-design/icons'
import { Link, useRouterState } from '@tanstack/react-router'

import type { RrhhSection, RrhhSectionMeta } from '../types/rrhh.types'

type RrhhSidebarProps = {
    variant?: 'sidebar' | 'tabs'
    onNavigate?: () => void
}

export const rrhhSections: RrhhSectionMeta[] = [
    {
        key: 'empleados',
        label: 'Empleados',
        description: 'Personal vinculado a la estructura organizacional.',
        icon: 'empleados',
        to: '/recursos-humanos/empleados',
    },
    {
        key: 'medicos',
        label: 'Médicos',
        description: 'Profesionales de salud y matrículas.',
        icon: 'medicos',
        to: '/recursos-humanos/medicos',
    },
]

function SectionIcon({ type }: { type: RrhhSectionMeta['icon'] }) {
    if (type === 'medicos') {
        return (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 6v12M8 10h8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <rect
                    x="5"
                    y="4"
                    width="14"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
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
                d="M16 7h5M18.5 4.5v5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function getActiveRrhhSection(pathname: string): RrhhSection {
    if (pathname.includes('/recursos-humanos/medicos')) return 'medicos'
    return 'empleados'
}

export function getRrhhSectionMeta(section: RrhhSection): RrhhSectionMeta {
    return rrhhSections.find((item) => item.key === section) ?? rrhhSections[0]
}

function NavItem({
    section,
    isActive,
    onNavigate,
    compact = false,
}: {
    section: RrhhSectionMeta
    isActive: boolean
    onNavigate?: () => void
    compact?: boolean
}) {
    return (
        <Link
            to={section.to}
            className={[
                'rrhh-nav-item',
                isActive ? 'rrhh-nav-item--active' : '',
                compact ? 'rrhh-nav-item--compact' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
        >
            <span className="rrhh-nav-item__icon" aria-hidden>
                <SectionIcon type={section.icon} />
            </span>
            <span className="rrhh-nav-item__content">
                <span className="rrhh-nav-item__label">{section.label}</span>
            </span>
            {!compact ? (
                <RightOutlined className="rrhh-nav-item__chevron" aria-hidden />
            ) : null}
        </Link>
    )
}

export function RrhhSidebar({ variant = 'sidebar', onNavigate }: RrhhSidebarProps) {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const activeSection = getActiveRrhhSection(pathname)

    if (variant === 'tabs') {
        return (
            <nav className="rrhh-tabs" aria-label="Secciones de recursos humanos">
                <div className="rrhh-tabs__scroll">
                    {rrhhSections.map((section) => (
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
        <nav className="rrhh-sidebar" aria-label="Secciones de recursos humanos">
            <p className="rrhh-sidebar__eyebrow">Gestión de personal</p>
            <div className="rrhh-sidebar__list">
                {rrhhSections.map((section) => (
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
