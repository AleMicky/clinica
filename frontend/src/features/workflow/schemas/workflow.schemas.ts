import { z } from 'zod'

export const createWorkflowDefinitionSchema = z.object({
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    description: z.string().trim().max(500),
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
    description: '',
    module: '',
    entityName: '',
    isActive: true,
}

export const createWorkflowStateSchema = z.object({
    code: z.string().trim().min(1, 'El código es obligatorio.').max(100),
    name: z.string().trim().min(1, 'El nombre es obligatorio.').max(200),
    description: z.string().trim().max(500),
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
    description: '',
    isInitial: false,
    isFinal: false,
    color: '#1677ff',
    order: 0,
}

export const createWorkflowTransitionSchema = z.object({
    fromStateId: z.string().trim().min(1, 'Seleccione el estado origen.'),
    toStateId: z.string().trim().min(1, 'Seleccione el estado destino.'),
    actionCode: z.string().trim().min(1, 'El código de acción es obligatorio.').max(100),
    actionName: z.string().trim().min(1, 'El nombre de acción es obligatorio.').max(200),
    description: z.string().trim().max(500),
    requiredRole: z.string().trim().max(100).optional().nullable(),
    requiresComment: z.boolean(),
    isActive: z.boolean().default(true),
})

export const updateWorkflowTransitionSchema = createWorkflowTransitionSchema

export type CreateWorkflowTransitionFormValues = z.output<typeof createWorkflowTransitionSchema>
export type UpdateWorkflowTransitionFormValues = CreateWorkflowTransitionFormValues

export const createWorkflowTransitionDefaultValues: z.input<typeof createWorkflowTransitionSchema> = {
    fromStateId: '',
    toStateId: '',
    actionCode: '',
    actionName: '',
    description: '',
    requiredRole: '',
    requiresComment: false,
    isActive: true,
}

export const executeWorkflowTransitionSchema = z.object({
    actionCode: z.string().trim().min(1, 'Seleccione una acción.'),
    comment: z.string().trim().max(1000).optional().nullable(),
})

export type ExecuteWorkflowTransitionFormValues = z.output<typeof executeWorkflowTransitionSchema>

export const executeWorkflowTransitionDefaultValues: z.input<typeof executeWorkflowTransitionSchema> = {
    actionCode: '',
    comment: '',
}
