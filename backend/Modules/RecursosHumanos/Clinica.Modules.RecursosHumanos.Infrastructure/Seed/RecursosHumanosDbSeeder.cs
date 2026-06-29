using System.Globalization;
using System.Text;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Seed;

public static class RecursosHumanosDbSeeder
{
    private static readonly (string Codigo, string Nombre)[] Areas =
    [
        ("ARE-001", "Administrativa"),
        ("ARE-002", "Atención en Salud")
    ];

    private static readonly (string Codigo, string Nombre, string AreaCodigo)[] Departamentos =
    [
        ("DEP-ADM-001", "Dirección", "ARE-001"),
        ("DEP-ADM-002", "Administración", "ARE-001"),
        ("DEP-ADM-003", "Finanzas", "ARE-001"),
        ("DEP-ADM-004", "Estadística", "ARE-001"),
        ("DEP-ADM-005", "Atención al Cliente", "ARE-001"),
        ("DEP-ADM-006", "Servicios Generales", "ARE-001"),

        ("DEP-SAL-001", "Atención Médica", "ARE-002"),
        ("DEP-SAL-002", "Enfermería", "ARE-002"),
        ("DEP-SAL-003", "Apoyo al Diagnóstico y Tratamiento", "ARE-002")
    ];

    private static readonly (string Codigo, string Nombre, string DepartamentoCodigo)[] Servicios =
    [
        ("SER-DIR-001", "Administración", "DEP-ADM-001"),

        ("SER-ADM-001", "Gestión Administrativa", "DEP-ADM-002"),

        ("SER-FIN-001", "Contabilidad", "DEP-ADM-003"),

        ("SER-EST-001", "Información", "DEP-ADM-004"),
        ("SER-EST-002", "Archivo", "DEP-ADM-004"),

        ("SER-CLI-001", "Recepción", "DEP-ADM-005"),

        ("SER-SGE-001", "Limpieza", "DEP-ADM-006"),
        ("SER-SGE-002", "Cocina", "DEP-ADM-006"),
        ("SER-SGE-003", "Ropería", "DEP-ADM-006"),
        ("SER-SGE-004", "Seguridad", "DEP-ADM-006"),
        ("SER-SGE-005", "Mantenimiento", "DEP-ADM-006"),
        ("SER-SGE-006", "Lavandería y Planchado", "DEP-ADM-006"),

        ("SER-MED-001", "Médico de Guardia", "DEP-SAL-001"),
        ("SER-MED-002", "Quirófano", "DEP-SAL-001"),
        ("SER-MED-003", "Consulta Externa", "DEP-SAL-001"),

        ("SER-ENF-001", "Jefatura de Enfermería", "DEP-SAL-002"),
        ("SER-ENF-002", "Licenciados en Enfermería", "DEP-SAL-002"),
        ("SER-ENF-003", "Técnicos Medios en Enfermería", "DEP-SAL-002"),
        ("SER-ENF-004", "Técnicos en Enfermería", "DEP-SAL-002"),
        ("SER-ENF-005", "Auxiliares de Enfermería", "DEP-SAL-002"),

        ("SER-DIA-001", "Ecografía", "DEP-SAL-003"),
        ("SER-DIA-002", "Rayos X", "DEP-SAL-003"),
        ("SER-DIA-003", "Laboratorio", "DEP-SAL-003"),
        ("SER-DIA-004", "Servicio Transfusional", "DEP-SAL-003"),
        ("SER-DIA-005", "Farmacia", "DEP-SAL-003"),
        ("SER-DIA-006", "Nutrición", "DEP-SAL-003")
    ];

    private static readonly string[] Cargos =
    [
        "Administrador",
        "Anestesiología",
        "Anestesiólogo",
        "Archivista",
        "Auxiliar Administrativo",
        "Auxiliar Administrativo de Caja",
        "Auxiliar de Caja y Seguros",
        "Auxiliar de Enfermería",
        "Auxiliar de Enfermería de Apoyo",
        "Auxiliar de Farmacia",
        "Auxiliar de Laboratorio",
        "Auxiliar de Marketing y Admisión",
        "Ayudante de Cocina",
        "Ayudante de Lavado",
        "Ayudante de Limpieza",
        "Cajas",
        "Cajas y Tesorería",
        "Cajero",
        "Cardiología",
        "Circulante",
        "Cirugía General",
        "Cirugía Plástica",
        "Colposcopia",
        "Contador",
        "Director General",
        "Director Médico",
        "Ecografista",
        "Encargado de Cocina",
        "Encargado de Costura",
        "Encargado de Esterilización",
        "Encargado de Limpieza",
        "Encargado de Mantenimiento",
        "Encargado de Neonatología",
        "Encargado de Planchado",
        "Encargado de Quirófano",
        "Encargado de Rayos X",
        "Encargado de Servicio",
        "Encargado de UTI",
        "Enfermero de Base",
        "Enfermero de Emergencias",
        "Enfermero de Esterilización",
        "Enfermero de Quirófano",
        "Enfermero de Salas de Internación",
        "Enfermero de Servicio Crítico",
        "Estadígrafo",
        "Esterilización",
        "Farmacia",
        "Gastroenterología",
        "Gerente Administrativo",
        "Gerente Administrativo Financiero",
        "Geriatría",
        "Ginecología",
        "Guardia de Seguridad / Portero",
        "Instrumentista",
        "Instrumentista Quirúrgico",
        "Jefe de Enfermería",
        "Laboratorios",
        "Lavado y Planchado",
        "Limpieza",
        "Marketing",
        "Medicina Crítica y Terapia Intensiva",
        "Medicina Interna",
        "Médico",
        "Médico de Guardia",
        "Médico General de Guardia",
        "Otorrinolaringología",
        "Pediatría",
        "Personal de Esterilización",
        "Planchado",
        "Psiquiatra",
        "Psiquiatría",
        "Quirófano",
        "Radiólogo",
        "Recepcionista",
        "Regente de Farmacia",
        "Responsable",
        "Responsable de Esterilización",
        "Responsable de Quirófano",
        "Supervisor de Enfermería",
        "Técnico en Rayos X",
        "Terapia Intensiva",
        "Traumatología",
        "Traumatólogo",
        "Urólogo"
    ];

    private static readonly string[] Profesiones =
    [
        "Anestesiólogo",
        "Auxiliar de Enfermería",
        "Auxiliar de Laboratorio",
        "Bachiller",
        "Bioquímico",
        "Bioquímico Farmacéutico",
        "Cardiólogo",
        "Cirujano General",
        "Cirujano Geriatra",
        "Cirujano Plástico",
        "Contador",
        "Gastroenterólogo",
        "Ginecólogo",
        "Ginecólogo Obstetra",
        "Hematólogo",
        "Imagenólogo",
        "Ingeniero Comercial",
        "Laboratorista",
        "Licenciado en Contaduría Pública",
        "Licenciado en Enfermería",
        "Médico General",
        "Médico General Dermatoestético",
        "Médico Intensivista",
        "Médico Internista",
        "Neurocirujano",
        "Nutricionista",
        "Otorrinolaringólogo",
        "Pediatra",
        "Pediatra Neonatólogo",
        "Psiquiatra",
        "Reumatólogo",
        "Secretaria Ejecutiva",
        "Técnico de Laboratorio",
        "Técnico en Enfermería",
        "Técnico en Radiología",
        "Técnico Medio",
        "Técnico Medio en Enfermería",
        "Traumatólogo",
        "Urólogo"
    ];

    private static readonly string[] Especialidades =
    [
        "Anestesiología",
        "Cardiología",
        "Cirugía General",
        "Cirugía Plástica, Estética y Reconstructiva",
        "Ecografía",
        "Farmacia",
        "Gastroenterología",
        "Geriatría",
        "Ginecología y Obstetricia",
        "Hematología",
        "Imagenología",
        "Laboratorio Clínico",
        "Medicina Crítica y Terapia Intensiva",
        "Medicina Dermatoestética",
        "Medicina Interna",
        "Neonatología",
        "Neurocirugía",
        "Nutrición Clínica",
        "Otorrinolaringología",
        "Pediatría",
        "Psiquiatría",
        "Radiología",
        "Reumatología",
        "Traumatología",
        "Urología"
    ];

    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("RecursosHumanosDbSeeder");

        var context = services.GetRequiredService<RecursosHumanosDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context);

        logger.LogInformation("Migraciones y datos iniciales de RecursosHumanos aplicadas correctamente.");
    }

    private static async Task SeedAsync(RecursosHumanosDbContext context)
    {
        await SeedAreasAsync(context);
        await SeedDepartamentosAsync(context);
        await SeedServiciosAsync(context);
        await SeedCargosAsync(context);
        await SeedProfesionesAsync(context);
        await SeedEspecialidadesAsync(context);
    }

    private static async Task SeedAreasAsync(RecursosHumanosDbContext context)
    {
        foreach (var item in Areas)
        {
            var area = await context.Areas.FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (area is null)
            {
                context.Areas.Add(new Area
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = null
                });
            }
            else
            {
                area.Nombre = item.Nombre;
                area.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedDepartamentosAsync(RecursosHumanosDbContext context)
    {
        foreach (var item in Departamentos)
        {
            var area = await context.Areas.FirstAsync(x => x.Codigo == item.AreaCodigo);

            var departamento = await context.Departamentos
                .FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (departamento is null)
            {
                context.Departamentos.Add(new Departamento
                {
                    AreaId = area.Id,
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = null
                });
            }
            else
            {
                departamento.AreaId = area.Id;
                departamento.Nombre = item.Nombre;
                departamento.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedServiciosAsync(RecursosHumanosDbContext context)
    {
        foreach (var item in Servicios)
        {
            var departamento = await context.Departamentos
                .FirstAsync(x => x.Codigo == item.DepartamentoCodigo);

            var servicio = await context.Servicios
                .FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (servicio is null)
            {
                context.Servicios.Add(new Servicio
                {
                    DepartamentoId = departamento.Id,
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = null
                });
            }
            else
            {
                servicio.DepartamentoId = departamento.Id;
                servicio.Nombre = item.Nombre;
                servicio.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCargosAsync(RecursosHumanosDbContext context)
    {
        var orden = 1;

        foreach (var nombre in Cargos.Select(x => x.Trim()).Where(x => !string.IsNullOrWhiteSpace(x)).DistinctBy(ToCode))
        {
            var codigo = ToCode(nombre);

            var cargo = await context.Cargos.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (cargo is null)
            {
                context.Cargos.Add(new Cargo
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null,
                });
            }
            else
            {
                cargo.Nombre = nombre;
                cargo.Descripcion = null;
            }

            orden++;
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedProfesionesAsync(RecursosHumanosDbContext context)
    {
        var orden = 1;

        foreach (var nombre in Profesiones.Select(x => x.Trim()).Where(x => !string.IsNullOrWhiteSpace(x)).DistinctBy(ToCode))
        {
            var codigo = ToCode(nombre);

            var profesion = await context.Profesiones.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (profesion is null)
            {
                context.Profesiones.Add(new Profesion
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null,
                });
            }
            else
            {
                profesion.Nombre = nombre;
                profesion.Descripcion = null;
            }

            orden++;
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedEspecialidadesAsync(RecursosHumanosDbContext context)
    {
        var orden = 1;

        foreach (var nombre in Especialidades.Select(x => x.Trim()).Where(x => !string.IsNullOrWhiteSpace(x)).DistinctBy(ToCode))
        {
            var codigo = ToCode(nombre);

            var especialidad = await context.Especialidades.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (especialidad is null)
            {
                context.Especialidades.Add(new Especialidad
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null,
                });
            }
            else
            {
                especialidad.Nombre = nombre;
                especialidad.Descripcion = null;
            }

            orden++;
        }

        await context.SaveChangesAsync();
    }

    private static string ToCode(string value)
    {
        var normalized = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
                continue;

            var upper = char.ToUpperInvariant(c);

            if (char.IsLetterOrDigit(upper))
            {
                builder.Append(upper);
            }
            else if (builder.Length > 0 && builder[^1] != '_')
            {
                builder.Append('_');
            }
        }

        return builder.ToString().Trim('_');
    }
}