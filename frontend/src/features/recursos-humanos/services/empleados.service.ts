import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { empleadoEndpoints } from '../../../shared/api/endpoints'
import type {
    CreateEmpleadoPayload,
    Empleado,
    EmpleadoQuery,
    UpdateEmpleadoPayload,
} from '../types/empleado.types'

export class EmpleadosService {
    getPaged(query: EmpleadoQuery) {
        return getPaged<Empleado>(empleadoEndpoints.root, query)
    }

    getById(id: string) {
        return get<Empleado>(empleadoEndpoints.byId(id))
    }

    create(data: CreateEmpleadoPayload) {
        return post<Empleado, CreateEmpleadoPayload>(empleadoEndpoints.root, data)
    }

    update(id: string, data: UpdateEmpleadoPayload) {
        return put<Empleado, UpdateEmpleadoPayload>(
            empleadoEndpoints.byId(id),
            data,
        )
    }

    delete(id: string) {
        return del<void>(empleadoEndpoints.byId(id))
    }
}

export const empleadosService = new EmpleadosService()
