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
        """["Propio medio","Ambulancia","Referido","Otro"]""";

    private static readonly string TipoAccidenteOpcionesJson =
        """["Tránsito","Laboral","Doméstico","Otro"]""";

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
                new("RECEPCION", "Datos de recepción", 0,
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true),
                    Campo("fecha", "Fecha", "DATE", 2, true),
                    Campo("hora", "Hora", "TIME", 3, true),
                    Campo("apellido_paterno", "Apellido Paterno", "TEXT", 4),
                    Campo("apellido_materno", "Apellido Materno", "TEXT", 5),
                    Campo("nombres", "Nombres", "TEXT", 6, true),
                    Campo("documento", "Documento", "TEXT", 7, true),
                    Campo("fecha_nacimiento", "Fecha Nacimiento", "DATE", 8),
                    Campo("edad", "Edad", "NUMBER", 9),
                    Campo("sexo", "Sexo", "SELECT", 10, opcionesJson: SexoOpcionesJson),
                    Campo("estado_civil", "Estado Civil", "SELECT", 11, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 12),
                    Campo("telefono", "Teléfono", "TEXT", 13),
                    Campo("profesion_ocupacion", "Profesión / Ocupación", "TEXT", 14)
                ]),
                new("DATOS_CONSULTA", "Datos de consulta", 1,
                [
                    Campo("servicio", "Servicio", "TEXT", 1),
                    Campo("fecha", "Fecha", "DATE", 2),
                    Campo("hora", "Hora", "TIME", 3)
                ]),
                new("SIGNOS_VITALES", "Signos vitales", 2,
                [
                    Campo("fc", "FC", "NUMBER", 1),
                    Campo("fr", "FR", "NUMBER", 2),
                    Campo("pa", "PA", "TEXT", 3),
                    Campo("temperatura", "Temperatura", "DECIMAL", 4),
                    Campo("saturacion_oxigeno", "SATO2", "DECIMAL", 5),
                    Campo("glucemia_capilar", "Glucemia capilar", "DECIMAL", 6),
                    Campo("glasgow", "Glasgow", "NUMBER", 7)
                ]),
                new("HISTORIA_CLINICA", "Historia clínica", 3,
                [
                    Campo("motivo_consulta", "Motivo de consulta", "TEXTAREA", 1),
                    Campo("enfermedad_actual", "Enfermedad actual", "TEXTAREA", 2),
                    Campo("examen_fisico", "Examen físico", "TEXTAREA", 3),
                    Campo("conducta_tratamiento", "Conducta y tratamiento", "TEXTAREA", 4),
                    Campo("observaciones", "Observaciones", "TEXTAREA", 5)
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
                new("RECEPCION", "Datos de recepción", 0,
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true),
                    Campo("nombres_apellidos", "Nombres y Apellidos", "TEXT", 2, true),
                    Campo("documento", "Documento", "TEXT", 3, true),
                    Campo("fecha_nacimiento", "Fecha Nacimiento", "DATE", 4),
                    Campo("edad", "Edad", "NUMBER", 5),
                    Campo("sexo", "Sexo", "SELECT", 6, opcionesJson: SexoOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 7),
                    Campo("telefono", "Teléfono", "TEXT", 8),
                    Campo("estado_civil", "Estado Civil", "SELECT", 9, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("fecha_atencion", "Fecha Atención", "DATE", 10, true),
                    Campo("hora_atencion", "Hora Atención", "TIME", 11, true),
                    Campo("referido_de", "Referido de", "TEXT", 12),
                    Campo("modo_ingreso", "Modo de Ingreso", "SELECT", 13, opcionesJson: ModoIngresoOpcionesJson),
                    Campo("acompanado_por", "Acompañado por", "TEXT", 14),
                    Campo("otros", "Otros", "TEXT", 15),
                    Campo("accidente_en", "Accidente en", "TEXT", 16),
                    Campo("tipo_accidente", "Tipo de Accidente", "SELECT", 17, opcionesJson: TipoAccidenteOpcionesJson),
                    Campo("notificacion_policial", "Notificación Policial", "RADIO", 18, opcionesJson: SiNoOpcionesJson),
                    Campo("fuente_historia", "Fuente de la Historia", "TEXT", 19),
                    Campo("motivo_consulta", "Motivo de Consulta", "TEXTAREA", 20, true)
                ]),
                new("DATOS_ATENCION", "Datos de atención", 1,
                [
                    Campo("fecha_atencion", "Fecha de atención", "DATE", 1),
                    Campo("hora_atencion", "Hora de atención", "TIME", 2),
                    Campo("referido_de", "Referido de", "TEXT", 3)
                ]),
                new("MODO_INGRESO", "Modo de ingreso", 2,
                [
                    Campo("modo_ingreso", "Modo de ingreso", "SELECT", 1),
                    Campo("acompanado_de", "Acompañado de", "SELECT", 2)
                ]),
                new("ACCIDENTE", "Datos del accidente", 3,
                [
                    Campo("accidente_en", "Accidente en", "SELECT", 1),
                    Campo("tipo_accidente", "Tipo de accidente", "SELECT", 2),
                    Campo("notificacion_policial", "Notificación policial", "CHECKBOX", 3),
                    Campo("responsable_policial", "Responsable policial", "TEXT", 4)
                ]),
                new("HISTORIA_CLINICA", "Historia clínica", 4,
                [
                    Campo("fuente_historia", "Fuente de la historia", "TEXT", 1),
                    Campo("motivo_consulta", "Motivo de consulta", "TEXTAREA", 2),
                    Campo("enfermedad_actual", "Enfermedad actual", "TEXTAREA", 3)
                ]),
                new("SIGNOS_VITALES", "Signos vitales", 5,
                [
                    Campo("fc", "FC", "NUMBER", 1),
                    Campo("fr", "FR", "NUMBER", 2),
                    Campo("pa", "PA", "TEXT", 3),
                    Campo("temperatura", "Temperatura", "DECIMAL", 4),
                    Campo("saturacion_oxigeno", "SATO2", "DECIMAL", 5),
                    Campo("glucemia_capilar", "Glucemia capilar", "DECIMAL", 6),
                    Campo("glasgow", "Glasgow", "NUMBER", 7)
                ]),
                new("EVALUACION", "Evaluación médica", 6,
                [
                    Campo("estado_general", "Estado general del paciente", "SELECT", 1),
                    Campo("conducta_tratamiento", "Conducta y tratamiento", "TEXTAREA", 2),
                    Campo("estudios_complementarios", "Estudios complementarios", "TEXTAREA", 3),
                    Campo("estudio_imagen", "Estudio de imagen", "TEXTAREA", 4),
                    Campo("diagnostico", "Diagnóstico", "TEXTAREA", 5)
                ]),
                new("INTERCONSULTA", "Interconsulta y referencia", 7,
                [
                    Campo("interconsulta_a", "Interconsulta a", "TEXT", 1),
                    Campo("hora_interconsulta", "Hora", "TIME", 2),
                    Campo("informacion_a", "Información a", "TEXT", 3),
                    Campo("referido_a", "Referido a", "TEXT", 4),
                    Campo("motivo_referencia", "Motivo de referencia", "TEXTAREA", 5)
                ]),
                new("EGRESO_EMERGENCIA", "Condición al egreso de emergencia", 8,
                [
                    Campo("condicion_egreso", "Condición al egreso", "SELECT", 1),
                    Campo("recomendaciones", "Recomendaciones y/u observaciones", "TEXTAREA", 2),
                    Campo("atendido_por", "Atendido por", "TEXT", 3)
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
                new("RECEPCION", "Datos de recepción", 0,
                [
                    Campo("historia_clinica", "Historia Clínica", "TEXT", 1, true),
                    Campo("apellido_paterno", "Apellido Paterno", "TEXT", 2, true),
                    Campo("apellido_materno", "Apellido Materno", "TEXT", 3),
                    Campo("nombres", "Nombres", "TEXT", 4, true),
                    Campo("documento", "Documento", "TEXT", 5, true),
                    Campo("fecha_nacimiento", "Fecha Nacimiento", "DATE", 6),
                    Campo("edad", "Edad", "NUMBER", 7),
                    Campo("sexo", "Sexo", "SELECT", 8, opcionesJson: SexoOpcionesJson),
                    Campo("estado_civil", "Estado Civil", "SELECT", 9, opcionesJson: EstadoCivilOpcionesJson),
                    Campo("direccion", "Dirección", "TEXT", 10),
                    Campo("ciudad", "Ciudad", "TEXT", 11),
                    Campo("telefono", "Teléfono", "TEXT", 12),
                    Campo("ocupacion", "Ocupación", "TEXT", 13),
                    Campo("lugar_trabajo", "Lugar de Trabajo", "TEXT", 14),
                    Campo("telefono_trabajo", "Teléfono Trabajo", "TEXT", 15),
                    Campo("responsable1_nombre", "Responsable 1 Nombre", "TEXT", 16),
                    Campo("responsable1_parentesco", "Responsable 1 Parentesco", "TEXT", 17),
                    Campo("responsable1_direccion", "Responsable 1 Dirección", "TEXT", 18),
                    Campo("responsable1_telefono", "Responsable 1 Teléfono", "TEXT", 19),
                    Campo("responsable1_documento", "Responsable 1 Documento", "TEXT", 20),
                    Campo("responsable2_nombre", "Responsable 2 Nombre", "TEXT", 21),
                    Campo("responsable2_parentesco", "Responsable 2 Parentesco", "TEXT", 22),
                    Campo("responsable2_direccion", "Responsable 2 Dirección", "TEXT", 23),
                    Campo("responsable2_telefono", "Responsable 2 Teléfono", "TEXT", 24),
                    Campo("responsable2_documento", "Responsable 2 Documento", "TEXT", 25)
                ]),
                new("DATOS_INTERNACION", "Datos de internación", 1,
                [
                    Campo("personal_solicita_internacion", "Personal de salud que solicita la internación", "TEXT", 1),
                    Campo("medico_tratante", "Médico tratante", "TEXT", 2),
                    Campo("diagnostico_ingreso", "Diagnóstico de ingreso", "TEXTAREA", 3),
                    Campo("fecha_ingreso", "Fecha", "DATE", 4),
                    Campo("hora_ingreso", "Hora", "TIME", 5)
                ]),
                new("EGRESO", "Egreso", 2,
                [
                    Campo("diagnostico_egreso", "Diagnóstico de egreso", "TEXTAREA", 1),
                    Campo("observaciones_procedimientos", "Observaciones y procedimientos", "TEXTAREA", 2),
                    Campo("fecha_egreso", "Fecha y hora de egreso", "DATETIME", 3),
                    Campo("condicion_egreso", "Condición al egresar", "SELECT", 4),
                    Campo("dias_internacion", "Días de internación", "NUMBER", 5),
                    Campo("causa_alta", "Causa de alta", "SELECT", 6)
                ]),
                new("RECIEN_NACIDO", "Recién nacido", 3,
                [
                    Campo("tipo_nacimiento", "Tipo", "SELECT", 1),
                    Campo("fecha_nacimiento", "Fecha de nacimiento", "DATE", 2),
                    Campo("sexo", "Sexo", "SELECT", 3),
                    Campo("condicion_nacer", "Condición al nacer", "SELECT", 4),
                    Campo("peso", "Peso", "DECIMAL", 5),
                    Campo("condicion_egreso_rn", "Condición de egreso", "SELECT", 6),
                    Campo("fecha_egreso_rn", "Fecha de egreso", "DATE", 7),
                    Campo("dias_internacion_rn", "N.º de días de internación", "NUMBER", 8)
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
                    Orden = seccionSeed.Orden
                };

                formulario.Secciones.Add(seccion);
            }
            else
            {
                seccion.Nombre = seccionSeed.Nombre;
                seccion.Orden = seccionSeed.Orden;
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
        CampoSeed[] Campos);

    private sealed record CampoSeed(
        string Codigo,
        string Etiqueta,
        string TipoCampoCodigo,
        int Orden,
        bool EsRequerido,
        string? OpcionesJson = null);
}