import type { ReactNode } from 'react'

type CrudSectionPanelProps = {
    filters: ReactNode
    actions: ReactNode
    caption: ReactNode
    children: ReactNode
    className?: string
}

export function CrudSectionPanel({
    filters,
    actions,
    caption,
    children,
    className = 'rrhh-empleados',
}: CrudSectionPanelProps) {
    return (
        <div className={`rrhh-section-panel ${className}`}>
            <div className="rrhh-section-panel__filters">
                {filters}
                {actions}
            </div>
            <div className="rrhh-section-panel__body">
                <p className="rrhh-section-panel__caption rrhh-empleados__caption">
                    {caption}
                </p>
                {children}
            </div>
        </div>
    )
}
