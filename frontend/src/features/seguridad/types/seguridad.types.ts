export type SeguridadSection = 'usuarios' | 'roles'

export type SeguridadSectionMeta = {
    key: SeguridadSection
    label: string
    description: string
    icon: 'users' | 'roles'
    to: '/seguridad/usuarios' | '/seguridad/roles'
}
