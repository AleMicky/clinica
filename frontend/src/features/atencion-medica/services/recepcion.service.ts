import type {
    CrearRecepcionAtencionPayload,
    FormularioRecepcion,
    RecepcionAtencion,
} from '../types/recepcion.types'
import { get, post } from '../../../shared/api/http'
import { atencionMedicaEndpoints } from '../../../shared/api/endpoints'

export const recepcionService = {
    crear(data: CrearRecepcionAtencionPayload) {
        return post<RecepcionAtencion, CrearRecepcionAtencionPayload>(
            atencionMedicaEndpoints.recepcion.root,
            data,
        )
    },

    getPendientes() {
        return get<RecepcionAtencion[]>(atencionMedicaEndpoints.recepcion.pendientes)
    },

    getById(id: string) {
        return get<RecepcionAtencion>(atencionMedicaEndpoints.recepcion.byId(id))
    },

    getFormulario(tipoAtencionId: string) {
        return get<FormularioRecepcion>(
            atencionMedicaEndpoints.recepcion.formulario(tipoAtencionId),
        )
    },
}
