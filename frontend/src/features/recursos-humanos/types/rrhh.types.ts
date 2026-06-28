export type RrhhCatalogSection = 'especialidades' | 'profesiones' | 'cargos'

export const rrhhCatalogSectionMeta: Record<
    RrhhCatalogSection,
    { title: string; description: string; entityLabel: string; newButtonLabel: string; searchPlaceholder: string }
> = {
    especialidades: {
        title: 'Especialidades médicas',
        description: 'Áreas de especialización del personal clínico.',
        entityLabel: 'especialidad',
        newButtonLabel: 'Nueva especialidad',
        searchPlaceholder: 'Buscar especialidad…',
    },
    profesiones: {
        title: 'Profesiones',
        description: 'Profesiones u oficios del personal de salud.',
        entityLabel: 'profesión',
        newButtonLabel: 'Nueva profesión',
        searchPlaceholder: 'Buscar profesión…',
    },
    cargos: {
        title: 'Cargos',
        description: 'Puestos y roles dentro de la institución.',
        entityLabel: 'cargo',
        newButtonLabel: 'Nuevo cargo',
        searchPlaceholder: 'Buscar cargo…',
    },
}
