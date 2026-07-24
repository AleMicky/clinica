import { getPaged, post } from '../../../shared/api/http'
import {
    atencionMedicaEndpoints,
    pacienteEndpoints,
} from '../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../shared/services/guid-crud.service'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type {
    Atencion,
    AtencionPagedQuery,
    AtencionRespuestaPagedQuery,
    CreateAtencionFormularioRespuestaPayload,
    CreateAtencionPayload,
    CreateFormularioCampoPayload,
    CreateFormularioClinicoPayload,
    CreateFormularioSeccionPayload,
    CreateTipoAtencionPayload,
    FormularioCampo,
    FormularioCampoPagedQuery,
    FormularioClinico,
    FormularioClinicoPagedQuery,
    FormularioSeccion,
    FormularioSeccionPagedQuery,
    AtencionFormularioRespuesta,
    PacienteLookup,
    RecepcionarAtencionPayload,
    TipoAtencion,
    TipoCampoFormulario,
    UpdateAtencionFormularioRespuestaPayload,
    UpdateAtencionPayload,
    UpdateFormularioCampoPayload,
    UpdateFormularioClinicoPayload,
    UpdateFormularioSeccionPayload,
    UpdateTipoAtencionPayload,
} from '../types/atencion-medica.types'

export const atencionesService = {
    ...createGuidCrudService<Atencion, CreateAtencionPayload, UpdateAtencionPayload>(
        atencionMedicaEndpoints.atenciones.root,
    ),
    getPaged(query: AtencionPagedQuery) {
        return getPaged<Atencion>(atencionMedicaEndpoints.atenciones.root, query)
    },
    recepcionar(data: RecepcionarAtencionPayload) {
        return post<Atencion, RecepcionarAtencionPayload>(
            atencionMedicaEndpoints.atenciones.recepcionar,
            data,
        )
    },
}

export const tiposAtencionService = {
    ...createGuidCrudService<
        TipoAtencion,
        CreateTipoAtencionPayload,
        UpdateTipoAtencionPayload
    >(atencionMedicaEndpoints.tiposAtencion.root),
    getPaged(query: PagedQuery) {
        return getPaged<TipoAtencion>(
            atencionMedicaEndpoints.tiposAtencion.root,
            query,
        )
    },
}

export const tiposCampoFormularioService = {
    ...createGuidCrudService<TipoCampoFormulario, never, never>(
        atencionMedicaEndpoints.tiposCampoFormulario.root,
    ),
    getPaged(query: PagedQuery) {
        return getPaged<TipoCampoFormulario>(
            atencionMedicaEndpoints.tiposCampoFormulario.root,
            query,
        )
    },
}

export const formulariosClinicosService = {
    ...createGuidCrudService<
        FormularioClinico,
        CreateFormularioClinicoPayload,
        UpdateFormularioClinicoPayload
    >(atencionMedicaEndpoints.formulariosClinicos.root),
    getPaged(query: FormularioClinicoPagedQuery) {
        return getPaged<FormularioClinico>(
            atencionMedicaEndpoints.formulariosClinicos.root,
            query,
        )
    },
}

export const formularioSeccionesService = {
    ...createGuidCrudService<
        FormularioSeccion,
        CreateFormularioSeccionPayload,
        UpdateFormularioSeccionPayload
    >(atencionMedicaEndpoints.formularioSecciones.root),
    getPaged(query: FormularioSeccionPagedQuery) {
        return getPaged<FormularioSeccion>(
            atencionMedicaEndpoints.formularioSecciones.root,
            query,
        )
    },
}

export const formularioCamposService = {
    ...createGuidCrudService<
        FormularioCampo,
        CreateFormularioCampoPayload,
        UpdateFormularioCampoPayload
    >(atencionMedicaEndpoints.formularioCampos.root),
    getPaged(query: FormularioCampoPagedQuery) {
        return getPaged<FormularioCampo>(
            atencionMedicaEndpoints.formularioCampos.root,
            query,
        )
    },
}

export const atencionRespuestasService = {
    ...createGuidCrudService<
        AtencionFormularioRespuesta,
        CreateAtencionFormularioRespuestaPayload,
        UpdateAtencionFormularioRespuestaPayload
    >(atencionMedicaEndpoints.atencionRespuestas.root),
    getPaged(query: AtencionRespuestaPagedQuery) {
        return getPaged<AtencionFormularioRespuesta>(
            atencionMedicaEndpoints.atencionRespuestas.root,
            query,
        )
    },
}

export const pacientesLookupService = {
    getPaged(query: PagedQuery) {
        return getPaged<PacienteLookup>(pacienteEndpoints.root, query)
    },
}

