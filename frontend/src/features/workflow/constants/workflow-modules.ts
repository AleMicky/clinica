/**
 * Catálogo de módulos/entidades para parametrizar workflows
 * sin hardcodear pantallas de dominio.
 */
export type WorkflowModuleCatalogEntry = {
    module: string
    label: string
    entities: Array<{
        entityName: string
        label: string
        /** Código sugerido de definición (opcional, solo guía). */
        suggestedDefinitionCode?: string
    }>
}

export const WORKFLOW_MODULE_CATALOG: WorkflowModuleCatalogEntry[] = [
    {
        module: 'AtencionMedica',
        label: 'Atención médica',
        entities: [
            {
                entityName: 'Atencion',
                label: 'Atención',
                suggestedDefinitionCode: 'ATENCION',
            },
        ],
    },
    {
        module: 'Laboratorio',
        label: 'Laboratorio',
        entities: [
            {
                entityName: 'Orden',
                label: 'Orden de laboratorio',
                suggestedDefinitionCode: 'LAB_ORDEN',
            },
            {
                entityName: 'Muestra',
                label: 'Muestra',
                suggestedDefinitionCode: 'LAB_MUESTRA',
            },
        ],
    },
    {
        module: 'Personas',
        label: 'Personas',
        entities: [
            {
                entityName: 'Paciente',
                label: 'Paciente',
            },
        ],
    },
    {
        module: 'RecursosHumanos',
        label: 'Recursos humanos',
        entities: [
            {
                entityName: 'Empleado',
                label: 'Empleado',
            },
        ],
    },
]

export function getWorkflowModuleOptions() {
    return WORKFLOW_MODULE_CATALOG.map((entry) => ({
        value: entry.module,
        label: entry.label,
    }))
}

export function getWorkflowEntityOptions(module: string | undefined) {
    const entry = WORKFLOW_MODULE_CATALOG.find((item) => item.module === module)
    if (!entry) return []

    return entry.entities.map((entity) => ({
        value: entity.entityName,
        label: entity.label,
    }))
}

export function getWorkflowModuleLabel(module: string) {
    return WORKFLOW_MODULE_CATALOG.find((item) => item.module === module)?.label ?? module
}

export function getWorkflowEntityLabel(module: string, entityName: string) {
    const entry = WORKFLOW_MODULE_CATALOG.find((item) => item.module === module)
    return (
        entry?.entities.find((entity) => entity.entityName === entityName)?.label ?? entityName
    )
}
