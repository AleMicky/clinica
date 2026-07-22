import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type { GuidCrudService } from '../../../shared/services/guid-crud.service'
import {
    atencionesService,
    atencionRespuestasService,
    especialidadesLookupService,
    formularioCamposService,
    formularioSeccionesService,
    formulariosClinicosService,
    pacientesLookupService,
    tiposAtencionService,
    tiposCampoFormularioService,
} from '../services/atencion-medica.service'
import type {
    AtencionPagedQuery,
    AtencionRespuestaPagedQuery,
    CreateAtencionPayload,
    FormularioCampoPagedQuery,
    FormularioClinicoPagedQuery,
    FormularioSeccionPagedQuery,
    UpdateAtencionPayload,
} from '../types/atencion-medica.types'

function createGuidCrudHooks<
    TResponse,
    TCreate,
    TUpdate,
    TQuery extends PagedQuery = PagedQuery,
>(
    queryKeyBase: readonly string[],
    service: GuidCrudService<TResponse, TCreate, TUpdate>,
    labels: { created: string; updated: string; deleted: string },
) {
    return {
        useList: (query: TQuery) =>
            useAppQuery({
                queryKey: [...queryKeyBase, 'list', query] as const,
                queryFn: () => service.getPaged(query),
            }),

        useDetail: (id: string | undefined) =>
            useAppQuery({
                queryKey: [...queryKeyBase, 'detail', id] as const,
                queryFn: () => service.getById(id!),
                enabled: Boolean(id),
            }),

        useCreate: () => {
            const queryClient = useQueryClient()

            return useAppMutation({
                mutationFn: (data: TCreate) => service.create(data),
                onSuccess: () => {
                    void queryClient.invalidateQueries({ queryKey: queryKeyBase })
                    notify.success(labels.created)
                },
                onError: (error) => {
                    notify.error('Error', getApiErrorMessage(error))
                },
            })
        },

        useUpdate: () => {
            const queryClient = useQueryClient()

            return useAppMutation({
                mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
                    service.update(id, data),
                onSuccess: () => {
                    void queryClient.invalidateQueries({ queryKey: queryKeyBase })
                    notify.success(labels.updated)
                },
                onError: (error) => {
                    notify.error('Error', getApiErrorMessage(error))
                },
            })
        },

        useDelete: () => {
            const queryClient = useQueryClient()

            return useAppMutation({
                mutationFn: (id: string) => service.delete(id),
                onSuccess: () => {
                    void queryClient.invalidateQueries({ queryKey: queryKeyBase })
                    notify.success(labels.deleted)
                },
                onError: (error) => {
                    notify.error('Error', getApiErrorMessage(error))
                },
            })
        },
    }
}

// ── Atenciones ──────────────────────────────────────────────────────

export function useAtenciones(query: AtencionPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.atenciones.list(query),
        queryFn: () => atencionesService.getPaged(query),
    })
}

export function useAtencion(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.atenciones.detail(id ?? ''),
        queryFn: () => atencionesService.getById(id!),
        enabled: Boolean(id),
    })
}

export function useCreateAtencion() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateAtencionPayload) => atencionesService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.atenciones.all,
            })
            notify.success('Atención creada', 'La atención se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear atención', getApiErrorMessage(error))
        },
    })
}

export function useUpdateAtencion() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAtencionPayload }) =>
            atencionesService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.atenciones.all,
            })
            notify.success('Atención actualizada', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar atención', getApiErrorMessage(error))
        },
    })
}

export function useDeleteAtencion() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => atencionesService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.atenciones.all,
            })
            notify.success('Atención eliminada', 'La atención se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar atención', getApiErrorMessage(error))
        },
    })
}

// ── Catálogos de apoyo ──────────────────────────────────────────────

export function useTiposAtencion(query: PagedQuery = { page: 1, pageSize: 100 }) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.tiposAtencion.list(query),
        queryFn: () => tiposAtencionService.getPaged(query),
    })
}

export function useFormulariosClinicos(query: FormularioClinicoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.formulariosClinicos.list(query),
        queryFn: () => formulariosClinicosService.getPaged(query),
        enabled: Boolean(query.tipoAtencionId),
    })
}

export const tiposAtencionHooks = createGuidCrudHooks(
    queryKeys.atencionMedica.tiposAtencion.all,
    tiposAtencionService,
    {
        created: 'Tipo de atención creado',
        updated: 'Tipo de atención actualizado',
        deleted: 'Tipo de atención eliminado',
    },
)

export const formulariosClinicosHooks = createGuidCrudHooks(
    queryKeys.atencionMedica.formulariosClinicos.all,
    formulariosClinicosService,
    {
        created: 'Formulario clínico creado',
        updated: 'Formulario clínico actualizado',
        deleted: 'Formulario clínico eliminado',
    },
)

export const formularioSeccionesHooks = createGuidCrudHooks(
    queryKeys.atencionMedica.formularioSecciones.all,
    formularioSeccionesService,
    {
        created: 'Sección creada',
        updated: 'Sección actualizada',
        deleted: 'Sección eliminada',
    },
)

export const formularioCamposHooks = createGuidCrudHooks(
    queryKeys.atencionMedica.formularioCampos.all,
    formularioCamposService,
    {
        created: 'Campo creado',
        updated: 'Campo actualizado',
        deleted: 'Campo eliminado',
    },
)

export const atencionRespuestasHooks = createGuidCrudHooks(
    queryKeys.atencionMedica.atencionRespuestas.all,
    atencionRespuestasService,
    {
        created: 'Respuesta guardada',
        updated: 'Respuesta actualizada',
        deleted: 'Respuesta eliminada',
    },
)

export function useTiposCampoFormulario(query: PagedQuery = { page: 1, pageSize: 100 }) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.tiposCampoFormulario.list(query),
        queryFn: () => tiposCampoFormularioService.getPaged(query),
    })
}

export function useFormularioSecciones(query: FormularioSeccionPagedQuery) {
    return formularioSeccionesHooks.useList(query)
}

export function useFormularioCampos(query: FormularioCampoPagedQuery) {
    return formularioCamposHooks.useList(query)
}

export function useAtencionRespuestas(query: AtencionRespuestaPagedQuery) {
    return atencionRespuestasHooks.useList(query)
}

export function useFormularioEstructura(formularioClinicoId: string | undefined) {
    const seccionesQuery = useFormularioSecciones({
        page: 1,
        pageSize: 100,
        formularioClinicoId,
    })

    const secciones = seccionesQuery.data?.items ?? []
    const seccionIds = secciones.map((s) => s.id).join(',')

    const camposQuery = useAppQuery({
        queryKey: [
            ...queryKeys.atencionMedica.formularioCampos.all,
            'estructura',
            formularioClinicoId,
            seccionIds,
        ] as const,
        queryFn: async () => {
            if (!formularioClinicoId || secciones.length === 0) {
                return { secciones: [], campos: [] }
            }

            const camposPorSeccion = await Promise.all(
                secciones.map(async (seccion) => {
                    const result = await formularioCamposService.getPaged({
                        page: 1,
                        pageSize: 500,
                        formularioSeccionId: seccion.id,
                    })
                    return result.items
                }),
            )

            return {
                secciones: [...secciones].sort((a, b) => a.orden - b.orden),
                campos: camposPorSeccion.flat(),
            }
        },
        enabled: Boolean(formularioClinicoId) && seccionesQuery.isSuccess,
    })

    return {
        secciones: camposQuery.data?.secciones ?? [],
        campos: camposQuery.data?.campos ?? [],
        isFetching: seccionesQuery.isFetching || camposQuery.isFetching,
    }
}

export function usePacientesLookup(query: PagedQuery = { page: 1, pageSize: 100 }) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.pacientesLookup.list(query),
        queryFn: () => pacientesLookupService.getPaged(query),
    })
}

export function useEspecialidadesLookup(query: PagedQuery = { page: 1, pageSize: 100 }) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.especialidadesLookup.list(query),
        queryFn: () => especialidadesLookupService.getPaged(query),
    })
}

