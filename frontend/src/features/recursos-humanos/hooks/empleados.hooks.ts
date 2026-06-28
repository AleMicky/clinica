import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { empleadosService } from '../services/empleados.service'
import type {
    CreateEmpleadoPayload,
    EmpleadoQuery,
    UpdateEmpleadoPayload,
} from '../types/empleado.types'

export function useEmpleados(query: EmpleadoQuery) {
    return useAppQuery({
        queryKey: queryKeys.empleados.list(query),
        queryFn: () => empleadosService.getPaged(query),
    })
}

export function useCreateEmpleado() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateEmpleadoPayload) => empleadosService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.empleados.all })
            notify.success('Empleado registrado', 'El empleado se guardó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al registrar', getApiErrorMessage(error))
        },
    })
}

export function useUpdateEmpleado() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmpleadoPayload }) =>
            empleadosService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.empleados.all })
            notify.success('Empleado actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar', getApiErrorMessage(error))
        },
    })
}

export function useDeleteEmpleado() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => empleadosService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.empleados.all })
            notify.success('Empleado eliminado', 'El registro se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar', getApiErrorMessage(error))
        },
    })
}
