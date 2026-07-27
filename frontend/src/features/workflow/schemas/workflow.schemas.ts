import { z } from 'zod'

export const createWorkflowDefinitionSchema = z.object({
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    module: z.string().trim().min(1, 'El módulo es obligatorio.').max(100),
    entityName: z.string().trim().min(1, 'La entidad es obligatoria.').max(100),
    isActive: z.boolean().default(true),
})

export const updateWorkflowDefinitionSchema = createWorkflowDefinitionSchema

export type CreateWorkflowDefinitionFormInput = z.input<typeof createWorkflowDefinitionSchema>
export type CreateWorkflowDefinitionFormValues = z.output<typeof createWorkflowDefinitionSchema>
export type UpdateWorkflowDefinitionFormValues = CreateWorkflowDefinitionFormValues

export const createWorkflowDefinitionDefaultValues: CreateWorkflowDefinitionFormInput = {
    code: '',
    name: '',
    module: '',
    entityName: '',
    isActive: true,
}

export const createWorkflowCustomQuerySchema = z.object({
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    description: z.string().trim().max(500).optional().nullable(),
    procedureName: z.string().trim().min(1, 'El procedimiento es obligatorio.').max(200),
})

export const updateWorkflowCustomQuerySchema = createWorkflowCustomQuerySchema

export type CreateWorkflowCustomQueryFormValues = z.output<typeof createWorkflowCustomQuerySchema>
export type UpdateWorkflowCustomQueryFormValues = CreateWorkflowCustomQueryFormValues

export const createWorkflowCustomQueryDefaultValues: z.input<typeof createWorkflowCustomQuerySchema> = {
    code: '',
    name: '',
    description: '',
    procedureName: '',
}

export const createWorkflowStateSchema = z.object({
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    isInitial: z.boolean(),
    isFinal: z.boolean(),
    color: z.string().trim().min(1, 'El color es obligatorio.').max(20),
    order: z.number().int().min(0),
})

export const updateWorkflowStateSchema = createWorkflowStateSchema

export type CreateWorkflowStateFormValues = z.output<typeof createWorkflowStateSchema>
export type UpdateWorkflowStateFormValues = CreateWorkflowStateFormValues

export const createWorkflowStateDefaultValues: z.input<typeof createWorkflowStateSchema> = {
    code: '',
    name: '',
    isInitial: false,
    isFinal: false,
    color: '#1677ff',
    order: 0,
}

const workflowAssignmentSchema = z
    .object({
        enabled: z.boolean(),
        type: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        areaId: z.string().trim().optional().nullable(),
        workflowCustomQueryId: z.string().trim().optional().nullable(),
        employeeIdsText: z.string().optional().nullable(),
    })
    .superRefine((value, ctx) => {
        if (!value.enabled) return

        if (value.type === 1 && !value.areaId?.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['areaId'],
                message: 'Indique el área.',
            })
        }

        if (value.type === 2) {
            const ids = (value.employeeIdsText ?? '')
                .split(/[\n,;]+/)
                .map((id) => id.trim())
                .filter(Boolean)

            if (ids.length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['employeeIdsText'],
                    message: 'Indique al menos un empleado (UUID).',
                })
            }
        }

        if (value.type === 3 && !value.workflowCustomQueryId?.trim()) {
            ctx.addIssue({
                code: 'custom',
                path: ['workflowCustomQueryId'],
                message: 'Seleccione una consulta personalizada.',
            })
        }
    })

export const createWorkflowTransitionSchema = z.object({
    fromStateId: z.string().trim().min(1, 'Seleccione el estado origen.'),
    toStateId: z.string().trim().min(1, 'Seleccione el estado destino.'),
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    requiresComment: z.boolean(),
    isActive: z.boolean().default(true),
    assignment: workflowAssignmentSchema,
})

export const updateWorkflowTransitionSchema = createWorkflowTransitionSchema

export type CreateWorkflowTransitionFormValues = z.output<typeof createWorkflowTransitionSchema>
export type UpdateWorkflowTransitionFormValues = CreateWorkflowTransitionFormValues

export const createWorkflowTransitionDefaultValues: z.input<typeof createWorkflowTransitionSchema> = {
    fromStateId: '',
    toStateId: '',
    code: '',
    name: '',
    requiresComment: false,
    isActive: true,
    assignment: {
        enabled: false,
        type: 1,
        areaId: '',
        workflowCustomQueryId: '',
        employeeIdsText: '',
    },
}

export const executeWorkflowTransitionSchema = z.object({
    code: z.string().trim().min(1, 'Seleccione una acción.'),
    employeeId: z.string().uuid('Indique el empleado ejecutor.'),
    comment: z.string().trim().max(1000).optional().nullable(),
})

export type ExecuteWorkflowTransitionFormValues = z.output<typeof executeWorkflowTransitionSchema>

export const executeWorkflowTransitionDefaultValues: z.input<typeof executeWorkflowTransitionSchema> = {
    code: '',
    employeeId: '',
    comment: '',
}

export function toAssignmentPayload(
    assignment: CreateWorkflowTransitionFormValues['assignment'],
) {
    if (!assignment.enabled) return null

    const employeeIds = (assignment.employeeIdsText ?? '')
        .split(/[\n,;]+/)
        .map((id) => id.trim())
        .filter(Boolean)

    return {
        type: assignment.type,
        areaId: assignment.type === 1 ? assignment.areaId || null : null,
        workflowCustomQueryId: assignment.type === 3 ? assignment.workflowCustomQueryId || null : null,
        employeeIds: assignment.type === 2 ? employeeIds : null,
    }
}
