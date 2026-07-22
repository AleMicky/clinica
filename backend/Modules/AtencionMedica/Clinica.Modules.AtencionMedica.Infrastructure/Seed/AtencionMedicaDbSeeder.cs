using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Seed;

public static class AtencionMedicaDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("AtencionMedicaDbSeeder");

        var context = services.GetRequiredService<AtencionMedicaDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context);

        logger.LogInformation("Migraciones y datos iniciales de Atención Médica aplicados correctamente.");
    }

    private static async Task SeedAsync(AtencionMedicaDbContext context)
    {
        await SeedTiposCampoFormularioAsync(context);
        await SeedTiposAtencionAsync(context);

        await SeedConsultaExternaAsync(context);
        await SeedEmergenciaAsync(context);
        await SeedInternacionAsync(context);
    }

    private static async Task SeedTiposCampoFormularioAsync(AtencionMedicaDbContext context)
    {
        var items = new[]
        {
            ("TEXT", "Texto", "TextBox", "string"),
            ("TEXTAREA", "Texto largo", "TextArea", "string"),
            ("NUMBER", "Número", "NumberInput", "int"),
            ("DECIMAL", "Decimal", "NumberInput", "decimal"),
            ("DATE", "Fecha", "DatePicker", "date"),
            ("TIME", "Hora", "TimePicker", "time"),
            ("DATETIME", "Fecha y hora", "DateTimePicker", "datetime"),
            ("SELECT", "Selección", "Select", "string"),
            ("RADIO", "Opción única", "Radio", "string"),
            ("CHECKBOX", "Checkbox", "Checkbox", "bool")
        };

        foreach (var item in items)
        {
            var exists = await context.TiposCampoFormulario
                .AnyAsync(x => x.Codigo == item.Item1);

            if (exists) continue;

            context.TiposCampoFormulario.Add(new TipoCampoFormulario
            {
                Codigo = item.Item1,
                Nombre = item.Item2,
                ControlFrontend = item.Item3,
                TipoDato = item.Item4
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedTiposAtencionAsync(AtencionMedicaDbContext context)
    {
        var items = new[]
        {
            ("CONSULTA_EXTERNA", "Consulta Externa"),
            ("EMERGENCIA", "Emergencia"),
            ("INTERNACION", "Internación")
        };

        foreach (var item in items)
        {
            var exists = await context.TiposAtencion
                .AnyAsync(x => x.Codigo == item.Item1);

            if (exists) continue;

            context.TiposAtencion.Add(new TipoAtencion
            {
                Codigo = item.Item1,
                Nombre = item.Item2
            });
        }

        await context.SaveChangesAsync();
    }

    private static readonly string SexoOpcionesJson =
        """["Masculino","Femenino","Otro"]""";

    private static readonly string EstadoCivilOpcionesJson =
        """["Soltero","Casado","Divorciado","Viudo","Unión libre"]""";

    private static readonly string ModoIngresoOpcionesJson =
        """["Caminando","Camilla","Ambulancia","Silla de Ruedas","En Brazos"]""";

    private static readonly string AcompanadoPorOpcionesJson =
        """["Familiares","Amigos","Solo","Ambulancia"]""";

    private static readonly string AccidenteEnOpcionesJson =
        """["Domicilio","Vía Pública","Trabajo"]""";

    private static readonly string TipoAccidenteOpcionesJson =
        """["Personal","Laboral","Tránsito","Agresión Física","No se conoce"]""";

    private static readonly string SiNoOpcionesJson =
        """["Sí","No"]""";

    private static async Task SeedConsultaExternaAsync(AtencionMedicaDbContext context)
    {
        await SeedFormularioAsync(
            context,
            "CONSULTA_EXTERNA",
            "FORM_CONSULTA_EXTERNA",
            "Hoja de Consulta Externa",
            [
                new("DATOS_GENERALES", "Datos generales", 0, "RECEPCION",
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true),
                    Campo("fecha", "Fecha", "DATE", 2, true),
                    Campo("hora", "Hora", "TIME", 3, true),
                    Campo("servicio", "Servicio", "TEXT", 4)
                ]),
                new("DATOS_PACIENTE", "Datos del paciente", 1, "RECEPCION",
                [
                    Campo("apellido_paterno", "Apellido Paterno", "TEXT", 1),
                    Campo("apellido_materno", "Apellido Materno", "TEXT", 2),
                    Campo("nombres", "Nombres", "TEXT", 3, true),
                    Campo("documento", "Documento de Identidad", "TEXT", 4, true),
                    Campo("fecha_nacimiento", "Fecha de Nacimiento", "DATE", 5),
                    Campo("edad", "Edad", "NUMBER", 6),
                    Campo("sexo", "Sexo", "SELECT", 7, opcionesJson: SexoOpcionesJson),
                    Campo("estado_civil", "Estado Civil", "SELECT", 8, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 9),
                    Campo("telefono", "Teléfono", "TEXT", 10),
                    Campo("profesion_ocupacion", "Profesión / Ocupación", "TEXT", 11)
                ]),
                new("DATOS_CLINICOS_RECEPCION", "Datos clínicos (recepción)", 2, "RECEPCION",
                [
                    Campo("motivo_consulta", "Motivo de Consulta", "TEXTAREA", 1, true),
                    Campo("observaciones_iniciales", "Observaciones Iniciales", "TEXTAREA", 2)
                ]),
                new("SIGNOS_VITALES", "Signos vitales (enfermería)", 3, "ENFERMERIA",
                [
                    Campo("peso", "Peso", "DECIMAL", 1),
                    Campo("talla", "Talla", "DECIMAL", 2),
                    Campo("imc", "Índice de Masa Corporal", "DECIMAL", 3),
                    Campo("pa", "Presión Arterial", "TEXT", 4),
                    Campo("fc", "Frecuencia Cardíaca", "NUMBER", 5),
                    Campo("fr", "Frecuencia Respiratoria", "NUMBER", 6),
                    Campo("temperatura", "Temperatura", "DECIMAL", 7),
                    Campo("saturacion_oxigeno", "Saturación de Oxígeno", "DECIMAL", 8),
                    Campo("glucemia", "Glucemia", "DECIMAL", 9)
                ]),
                new("CONSULTA_MEDICA", "Consulta médica", 4, "CONSULTA_MEDICA",
                [
                    Campo("enfermedad_actual", "Enfermedad Actual", "TEXTAREA", 1),
                    Campo("antecedentes_personales", "Antecedentes Personales", "TEXTAREA", 2),
                    Campo("antecedentes_familiares", "Antecedentes Familiares", "TEXTAREA", 3),
                    Campo("antecedentes_quirurgicos", "Antecedentes Quirúrgicos", "TEXTAREA", 4),
                    Campo("antecedentes_alergicos", "Antecedentes Alérgicos", "TEXTAREA", 5),
                    Campo("examen_fisico", "Examen Físico", "TEXTAREA", 6),
                    Campo("diagnostico", "Diagnóstico", "TEXTAREA", 7),
                    Campo("plan_terapeutico", "Plan Terapéutico", "TEXTAREA", 8),
                    Campo("tratamiento", "Tratamiento", "TEXTAREA", 9),
                    Campo("interconsulta", "Interconsulta", "TEXTAREA", 10),
                    Campo("estudios_complementarios", "Estudios Complementarios", "TEXTAREA", 11),
                    Campo("prescripcion_medica", "Prescripción Médica", "TEXTAREA", 12),
                    Campo("indicaciones", "Indicaciones", "TEXTAREA", 13),
                    Campo("firma_sello_medico", "Firma y Sello Médico", "TEXT", 14)
                ])
            ]);
    }

    private static async Task SeedEmergenciaAsync(AtencionMedicaDbContext context)
    {
        await SeedFormularioAsync(
            context,
            "EMERGENCIA",
            "FORM_EMERGENCIA",
            "Historia Clínica de Emergencias",
            [
                new("DATOS_GENERALES", "Datos generales", 0, "RECEPCION",
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true),
                    Campo("fecha_atencion", "Fecha Atención", "DATE", 2, true),
                    Campo("hora_atencion", "Hora Atención", "TIME", 3, true)
                ]),
                new("DATOS_PACIENTE", "Datos del paciente", 1, "RECEPCION",
                [
                    Campo("apellidos", "Apellidos", "TEXT", 1, true),
                    Campo("nombres", "Nombres", "TEXT", 2, true),
                    Campo("documento", "Documento de Identidad", "TEXT", 3, true),
                    Campo("fecha_nacimiento", "Fecha de Nacimiento", "DATE", 4),
                    Campo("edad", "Edad", "NUMBER", 5),
                    Campo("sexo", "Sexo", "SELECT", 6, opcionesJson: SexoOpcionesJson),
                    Campo("estado_civil", "Estado Civil", "SELECT", 7, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 8),
                    Campo("telefono", "Teléfono", "TEXT", 9)
                ]),
                new("INGRESO", "Ingreso", 2, "RECEPCION",
                [
                    Campo("referido_de", "Referido de", "TEXT", 1),
                    Campo("modo_ingreso", "Modo de Ingreso", "SELECT", 2, opcionesJson: ModoIngresoOpcionesJson),
                    Campo("acompanado_por", "Acompañado por", "SELECT", 3, opcionesJson: AcompanadoPorOpcionesJson),
                    Campo("otros", "Otros", "TEXT", 4)
                ]),
                new("DATOS_ACCIDENTE", "Datos del accidente", 3, "RECEPCION",
                [
                    Campo("accidente_en", "Accidente en", "SELECT", 1, opcionesJson: AccidenteEnOpcionesJson),
                    Campo("tipo_accidente", "Tipo de Accidente", "SELECT", 2, opcionesJson: TipoAccidenteOpcionesJson),
                    Campo("notificacion_policial", "Notificación Policial", "RADIO", 3, opcionesJson: SiNoOpcionesJson),
                    Campo("responsable_policial", "Responsable Policial", "TEXT", 4)
                ]),
                new("HISTORIA_CLINICA_RECEPCION", "Historia clínica (recepción)", 4, "RECEPCION",
                [
                    Campo("fuente_historia", "Fuente de la Historia", "TEXT", 1),
                    Campo("motivo_consulta", "Motivo de Consulta", "TEXTAREA", 2, true),
                    Campo("enfermedad_actual", "Enfermedad Actual", "TEXTAREA", 3)
                ]),
                new("SIGNOS_VITALES", "Signos vitales", 5, "ENFERMERIA",
                [
                    Campo("fc", "Frecuencia Cardíaca", "NUMBER", 1),
                    Campo("fr", "Frecuencia Respiratoria", "NUMBER", 2),
                    Campo("pa", "Presión Arterial", "TEXT", 3),
                    Campo("temperatura", "Temperatura", "DECIMAL", 4),
                    Campo("saturacion_oxigeno", "Saturación de Oxígeno", "DECIMAL", 5),
                    Campo("glucemia_capilar", "Glucemia Capilar", "DECIMAL", 6),
                    Campo("glasgow", "Escala de Glasgow", "NUMBER", 7)
                ]),
                new("EXAMEN_FISICO", "Examen físico", 6, "CONSULTA_MEDICA",
                [
                    Campo("estado_general", "Estado General", "TEXTAREA", 1),
                    Campo("examen_clinico", "Examen Clínico", "TEXTAREA", 2)
                ]),
                new("DIAGNOSTICO", "Diagnóstico", 7, "CONSULTA_MEDICA",
                [
                    Campo("diagnostico_principal", "Diagnóstico Principal", "TEXTAREA", 1),
                    Campo("diagnostico_secundario", "Diagnóstico Secundario", "TEXTAREA", 2)
                ]),
                new("TRATAMIENTO", "Tratamiento", 8, "CONSULTA_MEDICA",
                [
                    Campo("conducta", "Conducta", "TEXTAREA", 1),
                    Campo("tratamiento", "Tratamiento", "TEXTAREA", 2)
                ]),
                new("ESTUDIOS", "Estudios", 9, "CONSULTA_MEDICA",
                [
                    Campo("laboratorio", "Laboratorio", "TEXTAREA", 1),
                    Campo("imagenologia", "Imagenología", "TEXTAREA", 2),
                    Campo("otros_estudios", "Otros Estudios", "TEXTAREA", 3)
                ]),
                new("INTERCONSULTA", "Interconsulta", 10, "CONSULTA_MEDICA",
                [
                    Campo("especialidad", "Especialidad", "TEXT", 1),
                    Campo("hora_interconsulta", "Hora", "TIME", 2),
                    Campo("observaciones_interconsulta", "Observaciones", "TEXTAREA", 3)
                ]),
                new("REFERENCIA", "Referencia", 11, "CONSULTA_MEDICA",
                [
                    Campo("referido_a", "Referido a", "TEXT", 1),
                    Campo("motivo_referencia", "Motivo de Referencia", "TEXTAREA", 2)
                ]),
                new("EGRESO", "Egreso", 12, "CONSULTA_MEDICA",
                [
                    Campo("condicion_egreso", "Condición de Egreso", "TEXT", 1),
                    Campo("recomendaciones", "Recomendaciones", "TEXTAREA", 2),
                    Campo("observaciones_egreso", "Observaciones", "TEXTAREA", 3),
                    Campo("atendido_por", "Atendido por", "TEXT", 4),
                    Campo("firma", "Firma", "TEXT", 5),
                    Campo("sello", "Sello", "TEXT", 6)
                ])
            ]);
    }

    private static async Task SeedInternacionAsync(AtencionMedicaDbContext context)
    {
        await SeedFormularioAsync(
            context,
            "INTERNACION",
            "FORM_INTERNACION",
            "Formulario de Internación y Egreso",
            [
                new("DATOS_GENERALES", "Datos generales", 0, "RECEPCION",
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true)
                ]),
                new("DATOS_PACIENTE", "Datos del paciente", 1, "RECEPCION",
                [
                    Campo("apellido_paterno", "Apellido Paterno", "TEXT", 1, true),
                    Campo("apellido_materno", "Apellido Materno", "TEXT", 2),
                    Campo("nombres", "Nombres", "TEXT", 3, true),
                    Campo("documento", "Documento de Identidad", "TEXT", 4, true),
                    Campo("fecha_nacimiento", "Fecha de Nacimiento", "DATE", 5),
                    Campo("edad", "Edad", "NUMBER", 6),
                    Campo("sexo", "Sexo", "SELECT", 7, opcionesJson: SexoOpcionesJson),
                    Campo("estado_civil", "Estado Civil", "SELECT", 8, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 9),
                    Campo("ciudad", "Ciudad", "TEXT", 10),
                    Campo("telefono", "Teléfono", "TEXT", 11),
                    Campo("ocupacion", "Ocupación", "TEXT", 12),
                    Campo("lugar_trabajo", "Lugar de Trabajo", "TEXT", 13),
                    Campo("telefono_trabajo", "Teléfono del Trabajo", "TEXT", 14)
                ]),
                new("RESPONSABLE_1", "Responsable 1", 2, "RECEPCION",
                [
                    Campo("responsable1_nombre", "Nombre Completo", "TEXT", 1),
                    Campo("responsable1_parentesco", "Parentesco", "TEXT", 2),
                    Campo("responsable1_direccion", "Dirección", "TEXT", 3),
                    Campo("responsable1_telefono", "Teléfono", "TEXT", 4),
                    Campo("responsable1_documento", "Documento de Identidad", "TEXT", 5)
                ]),
                new("RESPONSABLE_2", "Responsable 2", 3, "RECEPCION",
                [
                    Campo("responsable2_nombre", "Nombre Completo", "TEXT", 1),
                    Campo("responsable2_parentesco", "Parentesco", "TEXT", 2),
                    Campo("responsable2_direccion", "Dirección", "TEXT", 3),
                    Campo("responsable2_telefono", "Teléfono", "TEXT", 4),
                    Campo("responsable2_documento", "Documento de Identidad", "TEXT", 5)
                ]),
                new("INTERNACION", "Internación", 4, "CONSULTA_MEDICA",
                [
                    Campo("personal_solicita_internacion", "Personal de Salud que solicita la Internación", "TEXT", 1),
                    Campo("medico_tratante", "Médico Tratante", "TEXT", 2),
                    Campo("diagnostico_ingreso", "Diagnóstico de Ingreso", "TEXTAREA", 3),
                    Campo("fecha_ingreso", "Fecha de Ingreso", "DATE", 4),
                    Campo("hora_ingreso", "Hora de Ingreso", "TIME", 5),
                    Campo("firma_sello_admision", "Firma y Sello de Admisión", "TEXT", 6)
                ]),
                new("EGRESO", "Egreso", 5, "CONSULTA_MEDICA",
                [
                    Campo("diagnostico_egreso", "Diagnóstico de Egreso", "TEXTAREA", 1),
                    Campo("procedimientos_realizados", "Procedimientos Realizados", "TEXTAREA", 2),
                    Campo("observaciones_egreso", "Observaciones", "TEXTAREA", 3),
                    Campo("fecha_egreso", "Fecha de Egreso", "DATE", 4),
                    Campo("hora_egreso", "Hora de Egreso", "TIME", 5),
                    Campo("condicion_egreso", "Condición de Egreso", "TEXT", 6),
                    Campo("dias_internacion", "Días de Internación", "NUMBER", 7),
                    Campo("causa_alta", "Causa de Alta", "TEXT", 8),
                    Campo("firma_sello_egreso", "Firma y Sello", "TEXT", 9),
                    Campo("firma_sello_medico_tratante", "Firma y Sello del Médico Tratante", "TEXT", 10)
                ]),
                new("RECIEN_NACIDO", "Recién nacido", 6, "CONSULTA_MEDICA",
                [
                    Campo("tipo_nacimiento", "Tipo de Nacimiento", "TEXT", 1),
                    Campo("fecha_nacimiento_rn", "Fecha de Nacimiento", "DATE", 2),
                    Campo("sexo_rn", "Sexo", "SELECT", 3, opcionesJson: SexoOpcionesJson),
                    Campo("condicion_nacer", "Condición al Nacer", "TEXT", 4),
                    Campo("peso_rn", "Peso", "DECIMAL", 5),
                    Campo("condicion_egreso_rn", "Condición de Egreso", "TEXT", 6),
                    Campo("fecha_egreso_rn", "Fecha de Egreso", "DATE", 7),
                    Campo("dias_internacion_rn", "Días de Internación", "NUMBER", 8)
                ])
            ]);
    }

    private static async Task SeedFormularioAsync(
        AtencionMedicaDbContext context,
        string tipoAtencionCodigo,
        string formularioCodigo,
        string formularioNombre,
        FormularioSeed[] secciones)
    {
        var tipoAtencion = await context.TiposAtencion
            .FirstAsync(x => x.Codigo == tipoAtencionCodigo);

        var formulario = await context.FormulariosClinicos
            .Include(x => x.Secciones)
            .ThenInclude(x => x.Campos)
            .FirstOrDefaultAsync(x => x.Codigo == formularioCodigo);

        if (formulario is null)
        {
            formulario = new FormularioClinico
            {
                TipoAtencionId = tipoAtencion.Id,
                Codigo = formularioCodigo,
                Nombre = formularioNombre,
                Version = 1
            };

            context.FormulariosClinicos.Add(formulario);
        }
        else
        {
            formulario.TipoAtencionId = tipoAtencion.Id;
            formulario.Nombre = formularioNombre;
        }

        foreach (var seccionSeed in secciones)
        {
            var seccion = formulario.Secciones
                .FirstOrDefault(x => x.Codigo == seccionSeed.Codigo);

            if (seccion is null)
            {
                seccion = new FormularioSeccion
                {
                    Codigo = seccionSeed.Codigo,
                    Nombre = seccionSeed.Nombre,
                    Orden = seccionSeed.Orden,
                    EtapaFlujo = seccionSeed.EtapaFlujo,
                    Visible = true
                };

                formulario.Secciones.Add(seccion);
            }
            else
            {
                seccion.Nombre = seccionSeed.Nombre;
                seccion.Orden = seccionSeed.Orden;
                seccion.EtapaFlujo = seccionSeed.EtapaFlujo;
                seccion.Visible = true;
            }

            foreach (var campoSeed in seccionSeed.Campos)
            {
                var tipoCampo = await context.TiposCampoFormulario
                    .FirstAsync(x => x.Codigo == campoSeed.TipoCampoCodigo);

                var campo = seccion.Campos
                    .FirstOrDefault(x => x.Codigo == campoSeed.Codigo);

                if (campo is null)
                {
                    seccion.Campos.Add(new FormularioCampo
                    {
                        Codigo = campoSeed.Codigo,
                        Etiqueta = campoSeed.Etiqueta,
                        TipoCampoFormularioId = tipoCampo.Id,
                        EsRequerido = campoSeed.EsRequerido,
                        Orden = campoSeed.Orden,
                        Visible = true,
                        OpcionesJson = campoSeed.OpcionesJson
                    });
                }
                else
                {
                    campo.Etiqueta = campoSeed.Etiqueta;
                    campo.TipoCampoFormularioId = tipoCampo.Id;
                    campo.EsRequerido = campoSeed.EsRequerido;
                    campo.Orden = campoSeed.Orden;
                    campo.Visible = true;
                    campo.OpcionesJson = campoSeed.OpcionesJson;
                }
            }
        }

        await context.SaveChangesAsync();
    }

    private static CampoSeed Campo(
        string codigo,
        string etiqueta,
        string tipoCampoCodigo,
        int orden,
        bool requerido = false,
        string? opcionesJson = null)
    {
        return new CampoSeed(codigo, etiqueta, tipoCampoCodigo, orden, requerido, opcionesJson);
    }

    private sealed record FormularioSeed(
        string Codigo,
        string Nombre,
        int Orden,
        string EtapaFlujo,
        CampoSeed[] Campos);

    private sealed record CampoSeed(
        string Codigo,
        string Etiqueta,
        string TipoCampoCodigo,
        int Orden,
        bool EsRequerido,
        string? OpcionesJson = null);
}