import { getPaged } from '../../../shared/api/http'
import {
    atencionMedicaEndpoints,
    catalogoClinicoEndpoints,
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
    EspecialidadLookup,
    FormularioCampo,
    FormularioCampoPagedQuery,
    FormularioClinico,
    FormularioClinicoPagedQuery,
    FormularioSeccion,
    FormularioSeccionPagedQuery,
    AtencionFormularioRespuesta,
    PacienteLookup,
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

export const especialidadesLookupService = {
    getPaged(query: PagedQuery) {
        return getPaged<EspecialidadLookup>(
            catalogoClinicoEndpoints.especialidades.root,
            query,
        )
    },
}

