import { useQueryClient, type QueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import {
    areasService,
    cargosService,
    especialidadesService,
    profesionesService,
} from '../services/catalogo-clinico.service'
import type {
    CreateAreaPayload,
    CreateCatalogoBasePayload,
    UpdateAreaPayload,
    UpdateCatalogoBasePayload,
} from '../types/catalogo-clinico.types'

function invalidateCatalogoHierarchy(qc: QueryClient) {
    void qc.invalidateQueries({
        queryKey: queryKeys.catalogoClinico.all,
    })
    void qc.invalidateQueries({
        queryKey: queryKeys.recursosHumanos.jerarquia.all,
    })
}

// ── Áreas ──────────────────────────────────────────────────────

export function useAreas(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.areas.list(query),
        queryFn: () => areasService.getPaged(query),
    })
}

export function useCreateArea() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateAreaPayload) => areasService.create(data),
        onSuccess: () => {
            invalidateCatalogoHierarchy(qc)
            notify.success('Área creada', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateArea() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateAreaPayload
        }) => areasService.update(id, data),
        onSuccess: () => {
            invalidateCatalogoHierarchy(qc)
            notify.success('Área actualizada', 'Cambios guardados.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteArea() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => areasService.delete(id),
        onSuccess: () => {
            invalidateCatalogoHierarchy(qc)
            notify.success('Área desactivada')
        },
        onError: (e) => notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}

// ── Catálogos simples (factory) ────────────────────────────────

type SimpleCatalogConfig = {
    queryKeyAll: readonly string[]
    listKey: (query: PagedQuery) => readonly unknown[]
    service: {
        getPaged: (query: PagedQuery) => ReturnType<typeof especialidadesService.getPaged>
        create: (data: CreateCatalogoBasePayload) => ReturnType<typeof especialidadesService.create>
        update: (id: string, data: UpdateCatalogoBasePayload) => ReturnType<typeof especialidadesService.update>
        delete: (id: string) => ReturnType<typeof especialidadesService.delete>
    }
    labels: { entity: string; created: string; updated: string; deleted: string }
}

function useSimpleCatalogList(config: SimpleCatalogConfig, query: PagedQuery) {
    return useAppQuery({
        queryKey: config.listKey(query),
        queryFn: () => config.service.getPaged(query),
    })
}

function useCreateSimpleCatalog(config: SimpleCatalogConfig) {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateCatalogoBasePayload) => config.service.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: config.queryKeyAll })
            notify.success(`${config.labels.entity} creado`, config.labels.created)
        },
        onError: (e) =>
            notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

function useUpdateSimpleCatalog(config: SimpleCatalogConfig) {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateCatalogoBasePayload
        }) => config.service.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: config.queryKeyAll })
            notify.success(`${config.labels.entity} actualizado`, config.labels.updated)
        },
        onError: (e) =>
            notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

function useDeleteSimpleCatalog(config: SimpleCatalogConfig) {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => config.service.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: config.queryKeyAll })
            notify.success(config.labels.deleted)
        },
        onError: (e) =>
            notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}

const especialidadesConfig: SimpleCatalogConfig = {
    queryKeyAll: queryKeys.catalogoClinico.especialidades.all,
    listKey: queryKeys.catalogoClinico.especialidades.list,
    service: especialidadesService,
    labels: {
        entity: 'Especialidad',
        created: 'Registro guardado correctamente.',
        updated: 'Cambios guardados.',
        deleted: 'Especialidad desactivada',
    },
}

const profesionesConfig: SimpleCatalogConfig = {
    queryKeyAll: queryKeys.catalogoClinico.profesiones.all,
    listKey: queryKeys.catalogoClinico.profesiones.list,
    service: profesionesService,
    labels: {
        entity: 'Profesión',
        created: 'Registro guardado correctamente.',
        updated: 'Cambios guardados.',
        deleted: 'Profesión desactivada',
    },
}

const cargosConfig: SimpleCatalogConfig = {
    queryKeyAll: queryKeys.catalogoClinico.cargos.all,
    listKey: queryKeys.catalogoClinico.cargos.list,
    service: cargosService,
    labels: {
        entity: 'Cargo',
        created: 'Registro guardado correctamente.',
        updated: 'Cambios guardados.',
        deleted: 'Cargo desactivado',
    },
}

export function useEspecialidades(query: PagedQuery) {
    return useSimpleCatalogList(especialidadesConfig, query)
}
export function useCreateEspecialidad() {
    return useCreateSimpleCatalog(especialidadesConfig)
}
export function useUpdateEspecialidad() {
    return useUpdateSimpleCatalog(especialidadesConfig)
}
export function useDeleteEspecialidad() {
    return useDeleteSimpleCatalog(especialidadesConfig)
}

export function useProfesiones(query: PagedQuery) {
    return useSimpleCatalogList(profesionesConfig, query)
}
export function useCreateProfesion() {
    return useCreateSimpleCatalog(profesionesConfig)
}
export function useUpdateProfesion() {
    return useUpdateSimpleCatalog(profesionesConfig)
}
export function useDeleteProfesion() {
    return useDeleteSimpleCatalog(profesionesConfig)
}

export function useCargos(query: PagedQuery) {
    return useSimpleCatalogList(cargosConfig, query)
}
export function useCreateCargo() {
    return useCreateSimpleCatalog(cargosConfig)
}
export function useUpdateCargo() {
    return useUpdateSimpleCatalog(cargosConfig)
}
export function useDeleteCargo() {
    return useDeleteSimpleCatalog(cargosConfig)
}
