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
    AtencionChildPagedQuery,
    AtencionPagedQuery,
    AtencionRespuestaPagedQuery,
    CreateAtencionFormularioRespuestaPayload,
    CreateAtencionPayload,
    CreateDiagnosticoAtencionPayload,
    CreateDiagnosticoPayload,
    CreateEstudioPayload,
    CreateFormularioCampoPayload,
    CreateFormularioClinicoPayload,
    CreateFormularioSeccionPayload,
    CreateInterconsultaPayload,
    CreatePrescripcionDetallePayload,
    CreatePrescripcionPayload,
    CreateResultadoEstudioPayload,
    CreateSignoVitalPayload,
    CreateTipoAtencionPayload,
    CreateTratamientoPayload,
    Diagnostico,
    DiagnosticoAtencion,
    DiagnosticoPagedQuery,
    EspecialidadLookup,
    Estudio,
    EstudioPagedQuery,
    FormularioCampo,
    FormularioCampoPagedQuery,
    FormularioClinico,
    FormularioClinicoPagedQuery,
    FormularioSeccion,
    FormularioSeccionPagedQuery,
    AtencionFormularioRespuesta,
    Interconsulta,
    PacienteLookup,
    Prescripcion,
    PrescripcionDetalle,
    PrescripcionDetallePagedQuery,
    ResultadoEstudio,
    ResultadoEstudioPagedQuery,
    SignoVital,
    TipoAtencion,
    TipoCampoFormulario,
    Tratamiento,
    UpdateAtencionFormularioRespuestaPayload,
    UpdateAtencionPayload,
    UpdateDiagnosticoAtencionPayload,
    UpdateDiagnosticoPayload,
    UpdateEstudioPayload,
    UpdateFormularioCampoPayload,
    UpdateFormularioClinicoPayload,
    UpdateFormularioSeccionPayload,
    UpdateInterconsultaPayload,
    UpdatePrescripcionDetallePayload,
    UpdatePrescripcionPayload,
    UpdateResultadoEstudioPayload,
    UpdateSignoVitalPayload,
    UpdateTipoAtencionPayload,
    UpdateTratamientoPayload,
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

export const diagnosticosService = {
    ...createGuidCrudService<
        Diagnostico,
        CreateDiagnosticoPayload,
        UpdateDiagnosticoPayload
    >(atencionMedicaEndpoints.diagnosticos.root),
    getPaged(query: DiagnosticoPagedQuery) {
        return getPaged<Diagnostico>(
            atencionMedicaEndpoints.diagnosticos.root,
            query,
        )
    },
}

export const diagnosticoAtencionesService = {
    ...createGuidCrudService<
        DiagnosticoAtencion,
        CreateDiagnosticoAtencionPayload,
        UpdateDiagnosticoAtencionPayload
    >(atencionMedicaEndpoints.diagnosticoAtenciones.root),
    getPaged(query: AtencionChildPagedQuery) {
        return getPaged<DiagnosticoAtencion>(
            atencionMedicaEndpoints.diagnosticoAtenciones.root,
            query,
        )
    },
}

export const signosVitalesService = {
    ...createGuidCrudService<
        SignoVital,
        CreateSignoVitalPayload,
        UpdateSignoVitalPayload
    >(atencionMedicaEndpoints.signosVitales.root),
    getPaged(query: AtencionChildPagedQuery) {
        return getPaged<SignoVital>(
            atencionMedicaEndpoints.signosVitales.root,
            query,
        )
    },
}

export const tratamientosService = {
    ...createGuidCrudService<
        Tratamiento,
        CreateTratamientoPayload,
        UpdateTratamientoPayload
    >(atencionMedicaEndpoints.tratamientos.root),
    getPaged(query: AtencionChildPagedQuery) {
        return getPaged<Tratamiento>(
            atencionMedicaEndpoints.tratamientos.root,
            query,
        )
    },
}

export const estudiosService = {
    ...createGuidCrudService<Estudio, CreateEstudioPayload, UpdateEstudioPayload>(
        atencionMedicaEndpoints.estudios.root,
    ),
    getPaged(query: EstudioPagedQuery) {
        return getPaged<Estudio>(atencionMedicaEndpoints.estudios.root, query)
    },
}

export const resultadosEstudioService = {
    ...createGuidCrudService<
        ResultadoEstudio,
        CreateResultadoEstudioPayload,
        UpdateResultadoEstudioPayload
    >(atencionMedicaEndpoints.resultadosEstudio.root),
    getPaged(query: ResultadoEstudioPagedQuery) {
        return getPaged<ResultadoEstudio>(
            atencionMedicaEndpoints.resultadosEstudio.root,
            query,
        )
    },
}

export const interconsultasService = {
    ...createGuidCrudService<
        Interconsulta,
        CreateInterconsultaPayload,
        UpdateInterconsultaPayload
    >(atencionMedicaEndpoints.interconsultas.root),
    getPaged(query: AtencionChildPagedQuery) {
        return getPaged<Interconsulta>(
            atencionMedicaEndpoints.interconsultas.root,
            query,
        )
    },
}

export const prescripcionesService = {
    ...createGuidCrudService<
        Prescripcion,
        CreatePrescripcionPayload,
        UpdatePrescripcionPayload
    >(atencionMedicaEndpoints.prescripciones.root),
    getPaged(query: AtencionChildPagedQuery) {
        return getPaged<Prescripcion>(
            atencionMedicaEndpoints.prescripciones.root,
            query,
        )
    },
}

export const prescripcionDetallesService = {
    ...createGuidCrudService<
        PrescripcionDetalle,
        CreatePrescripcionDetallePayload,
        UpdatePrescripcionDetallePayload
    >(atencionMedicaEndpoints.prescripcionDetalles.root),
    getPaged(query: PrescripcionDetallePagedQuery) {
        return getPaged<PrescripcionDetalle>(
            atencionMedicaEndpoints.prescripcionDetalles.root,
            query,
        )
    },
}
