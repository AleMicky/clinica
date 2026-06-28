export type SeguridadSection = 'usuarios' | 'roles'

export type SeguridadSectionMeta = {
    key: SeguridadSection
    label: string
    description: string
    icon: React.ReactNode
    to: '/seguridad/usuarios' | '/seguridad/roles'
}
