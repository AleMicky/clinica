import type { Atencion } from '../types/atencion-medica.types'
import { get } from '../../../shared/api/http'
import { atencionMedicaEndpoints } from '../../../shared/api/endpoints'

export const bandejaService = {
    getPendientesEnfermeria() {
        return get<Atencion[]>(atencionMedicaEndpoints.enfermeria.pendientes)
    },

    getPendientesConsultaMedica() {
        return get<Atencion[]>(atencionMedicaEndpoints.consultaMedica.pendientes)
    },
}
