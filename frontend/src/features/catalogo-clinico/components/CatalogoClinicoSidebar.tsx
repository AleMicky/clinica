import { AuditOutlined } from '@ant-design/icons'

import type { CatalogoClinicoSection } from '../types/catalogo-clinico.types'

export const catalogoClinicoSections: {
    key: CatalogoClinicoSection
    label: string
    icon: React.ReactNode
}[] = [
    {
        key: 'tipos-atencion',
        label: 'Tipos de atención',
        icon: <AuditOutlined />,
    },
]

const sectionMeta: Record<
    CatalogoClinicoSection,
    { title: string; description: string; icon: React.ReactNode }
> = {
    'tipos-atencion': {
        title: 'Tipos de atención',
        description: 'Clasificación de modalidades de atención clínica.',
        icon: <AuditOutlined />,
    },
}

export function getSectionMeta(section: CatalogoClinicoSection) {
    return sectionMeta[section]
}
