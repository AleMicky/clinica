import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import {
    programacionDiariaService,
    turnosService,
} from '../services/turnos.service'
import type {
    CreateProgramacionDiariaPayload,
    CreateTurnoPayload,
    MedicoDisponibilidadQuery,
    ProgramacionDiariaPagedQuery,
    TurnoPagedQuery,
    UpdateProgramacionDiariaPayload,
    UpdateTurnoPayload,
} from '../types/turnos.types'

export function useTurnos(query: TurnoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.turnos.list(query),
        queryFn: () => turnosService.getPaged(query),
    })
}

export function useCreateTurno() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateTurnoPayload) => turnosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.recursosHumanos.turnos.all })
            notify.success('Turno creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear turno', getApiErrorMessage(e)),
    })
}

export function useUpdateTurno() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTurnoPayload }) =>
            turnosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.recursosHumanos.turnos.all })
            notify.success('Turno actualizado', 'Cambios guardados.')
        },
        onError: (e) => notify.error('Error al actualizar turno', getApiErrorMessage(e)),
    })
}

export function useDeleteTurno() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => turnosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.recursosHumanos.turnos.all })
            notify.success('Turno eliminado')
        },
        onError: (e) => notify.error('Error al eliminar turno', getApiErrorMessage(e)),
    })
}

export function useProgramacionDiaria(query: ProgramacionDiariaPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.programacionDiaria.list(query),
        queryFn: () => programacionDiariaService.getPaged(query),
    })
}

export function useMedicoDisponibilidad(query: MedicoDisponibilidadQuery) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.programacionDiaria.disponibilidad(query),
        queryFn: () => programacionDiariaService.getDisponibilidad(query),
    })
}

export function useProgramacionesLookup() {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.programacionDiaria.programacionesLookup,
        queryFn: () => programacionDiariaService.getProgramacionesLookup(),
    })
}

export function useCreateProgramacionDiaria() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateProgramacionDiariaPayload) =>
            programacionDiariaService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.all,
            })
            notify.success('Programación creada', 'Registro guardado correctamente.')
        },
        onError: (e) =>
            notify.error('Error al crear programación', getApiErrorMessage(e)),
    })
}

export function useUpdateProgramacionDiaria() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateProgramacionDiariaPayload
        }) => programacionDiariaService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.all,
            })
            notify.success('Programación actualizada', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar programación', getApiErrorMessage(e)),
    })
}

export function useDeleteProgramacionDiaria() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => programacionDiariaService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.all,
            })
            notify.success('Programación eliminada')
        },
        onError: (e) =>
            notify.error('Error al eliminar programación', getApiErrorMessage(e)),
    })
}
