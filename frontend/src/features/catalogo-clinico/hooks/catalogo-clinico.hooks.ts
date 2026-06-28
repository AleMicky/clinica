import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import {
    areasService,
    cargosService,
    departamentosService,
    especialidadesService,
    prestacionesService,
    profesionesService,
    serviciosService,
} from '../services/catalogo-clinico.service'
import type {
    CreateCatalogoBasePayload,
    CreateDepartamentoPayload,
    CreatePrestacionPayload,
    CreateServicioPayload,
    UpdateCatalogoBasePayload,
    UpdateDepartamentoPayload,
    UpdatePrestacionPayload,
    UpdateServicioPayload,
} from '../types/catalogo-clinico.types'

// ── Áreas ──────────────────────────────────────────────────────

export function useAreas(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.areas.list(query),
        queryFn: () => areasService.getPaged(query),
    })
}

const HIERARCHY_LOOKUP_QUERY = { page: 1, pageSize: 100 } as const

export function useAreaDepartamentos(areaId: string | null) {
    const query = { ...HIERARCHY_LOOKUP_QUERY, areaId: areaId ?? undefined }

    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.departamentos.list(query),
        queryFn: () =>
            departamentosService.getPaged({ ...HIERARCHY_LOOKUP_QUERY, areaId: areaId! }),
        enabled: areaId !== null,
        select: (data) => data.items,
    })
}

export function useCreateArea() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateCatalogoBasePayload) => areasService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.areas.all,
            })
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
            data: UpdateCatalogoBasePayload
        }) => areasService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.areas.all,
            })
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
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Área desactivada')
        },
        onError: (e) => notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}

// ── Departamentos ──────────────────────────────────────────────

export function useDepartamentos(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.departamentos.list(query),
        queryFn: () => departamentosService.getPaged(query),
    })
}

export function useDepartamentoServicios(departamentoId: string | null) {
    const query = {
        ...HIERARCHY_LOOKUP_QUERY,
        departamentoId: departamentoId ?? undefined,
    }

    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.servicios.list(query),
        queryFn: () =>
            serviciosService.getPaged({
                ...HIERARCHY_LOOKUP_QUERY,
                departamentoId: departamentoId!,
            }),
        enabled: departamentoId !== null,
        select: (data) => data.items,
    })
}

export function useCreateDepartamento() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateDepartamentoPayload) =>
            departamentosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Departamento creado', 'Registro guardado correctamente.')
        },
        onError: (e) =>
            notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateDepartamento() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateDepartamentoPayload
        }) => departamentosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Departamento actualizado', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteDepartamento() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => departamentosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Departamento desactivado')
        },
        onError: (e) =>
            notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}

// ── Servicios ──────────────────────────────────────────────────

export function useServicioPrestaciones(servicioId: string | null) {
    return useAppQuery({
        queryKey: queryKeys.catalogoClinico.servicios.prestaciones(servicioId ?? ''),
        queryFn: () => serviciosService.getPrestaciones(servicioId!),
        enabled: servicioId !== null,
    })
}

export function useCreateServicio() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreateServicioPayload) => serviciosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Servicio creado', 'Registro guardado correctamente.')
        },
        onError: (e) =>
            notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateServicio() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateServicioPayload
        }) => serviciosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Servicio actualizado', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteServicio() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => serviciosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Servicio desactivado')
        },
        onError: (e) =>
            notify.error('Error al desactivar', getApiErrorMessage(e)),
    })
}

// ── Prestaciones ───────────────────────────────────────────────

export function useCreatePrestacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (data: CreatePrestacionPayload) =>
            prestacionesService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Prestación creada', 'Registro guardado correctamente.')
        },
        onError: (e) =>
            notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdatePrestacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdatePrestacionPayload
        }) => prestacionesService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Prestación actualizada', 'Cambios guardados.')
        },
        onError: (e) =>
            notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeletePrestacion() {
    const qc = useQueryClient()
    return useAppMutation({
        mutationFn: (id: string) => prestacionesService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.catalogoClinico.all,
            })
            notify.success('Prestación desactivada')
        },
        onError: (e) =>
            notify.error('Error al desactivar', getApiErrorMessage(e)),
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
