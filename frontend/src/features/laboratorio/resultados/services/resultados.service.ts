import { get, getPaged, post } from '../../../../shared/api/http'
import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import type {
    RegistrarResultadosPayload,
    Resultado,
    ResultadoPagedQuery,
    ValidarResultadoPayload,
} from '../types/resultado.types'

export const resultadosService = {
    getPaged(query: ResultadoPagedQuery) {
        return getPaged<Resultado>(laboratorioEndpoints.resultados.root, query)
    },
    getById(id: string) {
        return get<Resultado>(laboratorioEndpoints.resultados.byId(id))
    },
    registrar(solicitudId: string, data: RegistrarResultadosPayload) {
        return post<Resultado, RegistrarResultadosPayload>(
            laboratorioEndpoints.solicitudes.registrarResultados(solicitudId),
            data,
        )
    },
    validar(id: string, data: ValidarResultadoPayload) {
        return post<Resultado, ValidarResultadoPayload>(
            laboratorioEndpoints.resultados.validar(id),
            data,
        )
    },
}
