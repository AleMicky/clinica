using Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class EspecialidadSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedEspecialidades = BuildSeedEspecialidades();

        var codigos = seedEspecialidades
            .Select(e => e.Codigo)
            .ToArray();

        var existentes = await dbContext.Especialidades
            .Where(e => codigos.Contains(e.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                e => e.Codigo,
                StringComparer.OrdinalIgnoreCase
            );

        var faltaGuardar = false;

        foreach (var seed in seedEspecialidades)
        {
            if (porCodigo.ContainsKey(seed.Codigo))
                continue;

            dbContext.Especialidades.Add(new Especialidad
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            });

            faltaGuardar = true;
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static List<SeedEspecialidad> BuildSeedEspecialidades()
    {
        return
        [
            new("MED_GEN", "Medicina General",
                "Atención médica integral y de primera consulta."),

            new("MED_INT", "Medicina Interna",
                "Diagnóstico y tratamiento de enfermedades en adultos."),

            new("PED", "Pediatría",
                "Atención médica de niños y adolescentes."),

            new("GIN_OBS", "Ginecología y Obstetricia",
                "Atención de la salud femenina, embarazo, parto y puerperio."),

            new("CARD", "Cardiología",
                "Diagnóstico y tratamiento de enfermedades cardiovasculares."),

            new("DERM", "Dermatología",
                "Diagnóstico y tratamiento de enfermedades de la piel."),

            new("NEUR", "Neurología",
                "Diagnóstico y tratamiento de enfermedades del sistema nervioso."),

            new("TRAU", "Traumatología y Ortopedia",
                "Diagnóstico y tratamiento de lesiones y enfermedades musculoesqueléticas."),

            new("CIR_GEN", "Cirugía General",
                "Tratamiento quirúrgico de diversas enfermedades."),

            new("URO", "Urología",
                "Diagnóstico y tratamiento de enfermedades del aparato urinario y reproductor masculino."),

            new("OFT", "Oftalmología",
                "Diagnóstico y tratamiento de enfermedades de los ojos."),

            new("OTORR", "Otorrinolaringología",
                "Atención de enfermedades del oído, nariz y garganta."),

            new("GASTRO", "Gastroenterología",
                "Diagnóstico y tratamiento de enfermedades del aparato digestivo."),

            new("ENDO", "Endocrinología",
                "Diagnóstico y tratamiento de enfermedades hormonales y metabólicas."),

            new("NEFRO", "Nefrología",
                "Diagnóstico y tratamiento de enfermedades renales."),

            new("NEUMO", "Neumología",
                "Diagnóstico y tratamiento de enfermedades respiratorias."),

            new("REUMA", "Reumatología",
                "Diagnóstico y tratamiento de enfermedades reumáticas y autoinmunes."),

            new("ONCO", "Oncología",
                "Diagnóstico y tratamiento integral del cáncer."),

            new("HEMATO", "Hematología",
                "Diagnóstico y tratamiento de enfermedades de la sangre."),

            new("INFECT", "Infectología",
                "Diagnóstico y tratamiento de enfermedades infecciosas."),

            new("PSIQ", "Psiquiatría",
                "Diagnóstico y tratamiento de trastornos de salud mental."),

            new("GERIA", "Geriatría",
                "Atención integral del adulto mayor."),

            new("ANEST", "Anestesiología",
                "Manejo anestésico y perioperatorio del paciente."),

            new("RADIO", "Radiología e Imagenología",
                "Diagnóstico mediante estudios de imagen."),

            new("FISIAT", "Medicina Física y Rehabilitación",
                "Prevención, diagnóstico y rehabilitación de discapacidades físicas."),

            new("MED_FAM", "Medicina Familiar",
                "Atención integral y continua del paciente y su familia."),

            new("EMERG", "Medicina de Emergencias",
                "Atención inmediata de enfermedades y lesiones agudas."),

            new("CIR_PED", "Cirugía Pediátrica",
                "Tratamiento quirúrgico de enfermedades en pacientes pediátricos."),

            new("NEUROCIR", "Neurocirugía",
                "Tratamiento quirúrgico de enfermedades del sistema nervioso."),

            new("CIR_CARD", "Cirugía Cardiovascular",
                "Tratamiento quirúrgico de enfermedades cardiovasculares."),

            new("CIR_PLAS", "Cirugía Plástica",
                "Cirugía reconstructiva, reparadora y estética.")
        ];
    }

    private sealed record SeedEspecialidad(
        string Codigo,
        string Nombre,
        string? Descripcion
    );
}