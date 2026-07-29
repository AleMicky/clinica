import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import {
    grupoProgramacionService,
    programacionDiariaService,
    programacionService,
    turnosService,
} from '../services/turnos.service'
import type {
    CreateGrupoProgramacionPayload,
    CreateProgramacionDiariaPayload,
    CreateProgramacionPayload,
    CreateTurnoPayload,
    GrupoProgramacionPagedQuery,
    MedicoDisponibilidadQuery,
    ProgramacionDiariaPagedQuery,
    ProgramacionPagedQuery,
    SetGrupoProgramacionEmpleadosPayload,
    TurnoPagedQuery,
    UpdateGrupoProgramacionPayload,
    UpdateProgramacionDiariaPayload,
    UpdateProgramacionEstadoPayload,
    UpdateProgramacionPayload,
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

export function useGruposProgramacion(query: GrupoProgramacionPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.gruposProgramacion.list(query),
        queryFn: () => grupoProgramacionService.getPaged(query),
    })
}

export function useGrupoProgramacion(id?: string) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.gruposProgramacion.detail(id ?? ''),
        queryFn: () => grupoProgramacionService.getById(id!),
        enabled: !!id,
    })
}

export function useCreateGrupoProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateGrupoProgramacionPayload) =>
            grupoProgramacionService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.all,
            })
            notify.success('Grupo creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear grupo', getApiErrorMessage(e)),
    })
}

export function useUpdateGrupoProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateGrupoProgramacionPayload
        }) => grupoProgramacionService.update(id, data),
        onSuccess: (_data, vars) => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.all,
            })
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.detail(vars.id),
            })
            notify.success('Grupo actualizado', 'Cambios guardados.')
        },
        onError: (e) => notify.error('Error al actualizar grupo', getApiErrorMessage(e)),
    })
}

export function useSetGrupoProgramacionEmpleados() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: SetGrupoProgramacionEmpleadosPayload
        }) => grupoProgramacionService.setEmpleados(id, data),
        onSuccess: (_data, vars) => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.all,
            })
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.detail(vars.id),
            })
            notify.success('Miembros actualizados', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar miembros', getApiErrorMessage(e)),
    })
}

export function useDeleteGrupoProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => grupoProgramacionService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.gruposProgramacion.all,
            })
            notify.success('Grupo eliminado')
        },
        onError: (e) => notify.error('Error al eliminar grupo', getApiErrorMessage(e)),
    })
}

export function useProgramaciones(query: ProgramacionPagedQuery, enabled = true) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.programaciones.list(query),
        queryFn: () => programacionService.getPaged(query),
        enabled,
    })
}

export function useCreateProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateProgramacionPayload) => programacionService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programaciones.all,
            })
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.programacionesLookup,
            })
            notify.success('Programación creada', 'Cabecera del mes creada.')
        },
        onError: (e) =>
            notify.error('Error al crear programación', getApiErrorMessage(e)),
    })
}

export function useUpdateProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProgramacionPayload }) =>
            programacionService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programaciones.all,
            })
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.programacionesLookup,
            })
            notify.success('Programación actualizada', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar programación', getApiErrorMessage(e)),
    })
}

export function useUpdateProgramacionEstado() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateProgramacionEstadoPayload
        }) => programacionService.updateEstado(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programaciones.all,
            })
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programacionDiaria.all,
            })
            notify.success('Estado actualizado')
        },
        onError: (e) =>
            notify.error('Error al cambiar estado', getApiErrorMessage(e)),
    })
}

export function useDeleteProgramacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => programacionService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.recursosHumanos.programaciones.all,
            })
            notify.success('Programación eliminada')
        },
        onError: (e) =>
            notify.error('Error al eliminar programación', getApiErrorMessage(e)),
    })
}

export function useProgramacionDiaria(query: ProgramacionDiariaPagedQuery, enabled = true) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.programacionDiaria.list(query),
        queryFn: () => programacionDiariaService.getPaged(query),
        enabled,
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
            notify.success('Asignación guardada', 'Celda actualizada correctamente.')
        },
        onError: (e) =>
            notify.error('Error al guardar asignación', getApiErrorMessage(e)),
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
            notify.success('Asignación actualizada', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar asignación', getApiErrorMessage(e)),
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
            notify.success('Asignación eliminada')
        },
        onError: (e) =>
            notify.error('Error al eliminar asignación', getApiErrorMessage(e)),
    })
}
