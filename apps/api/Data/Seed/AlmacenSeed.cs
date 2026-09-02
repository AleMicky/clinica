using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class AlmacenSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedAlmacenes = BuildSeedAlmacenes();

        var codigos = seedAlmacenes
            .Select(a => a.Codigo)
            .ToArray();

        var existentes = await dbContext.Almacenes
            .Where(a => codigos.Contains(a.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                a => a.Codigo,
                StringComparer.OrdinalIgnoreCase
            );

        var faltaGuardar = false;

        foreach (var seed in seedAlmacenes)
        {
            if (porCodigo.TryGetValue(seed.Codigo, out var existente))
            {
                if (string.IsNullOrWhiteSpace(existente.Descripcion) && !string.IsNullOrWhiteSpace(seed.Descripcion))
                {
                    existente.Descripcion = seed.Descripcion;
                    faltaGuardar = true;
                }

                if (string.IsNullOrWhiteSpace(existente.Ubicacion) && !string.IsNullOrWhiteSpace(seed.Ubicacion))
                {
                    existente.Ubicacion = seed.Ubicacion;
                    faltaGuardar = true;
                }

                continue;
            }

            dbContext.Almacenes.Add(new Almacen
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                Ubicacion = seed.Ubicacion,
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

    private static List<SeedAlmacen> BuildSeedAlmacenes()
    {
        return
        [
            new(
                "ALM-CENT",
                "Almacén Central",
                "Almacén principal de recepción, custodia y distribución de insumos médicos y generales.",
                "Edificio Principal - Planta Baja"
            ),
            new(
                "ALM-FARM",
                "Farmacia Central",
                "Almacenamiento, dispensación y custodia de medicamentos y fármacos hospitalarios.",
                "Edificio Principal - Piso 1"
            ),
            new(
                "ALM-QUI",
                "Almacén de Quirófano",
                "Depósito de material quirúrgico, instrumental, prótesis y material estéril.",
                "Bloque Quirúrgico - Piso 2"
            ),
            new(
                "ALM-URG",
                "Farmacia de Urgencias",
                "Botiquín y stock de emergencia de insumos y medicamentos para atención inmediata.",
                "Área de Urgencias y Emergencias"
            ),
            new(
                "ALM-LAB",
                "Almacén de Laboratorio",
                "Custodia de reactivos químicos, tubos de extracción y material para análisis clínicos.",
                "Laboratorio Clínico - Sótano 1"
            ),
            new(
                "ALM-HOSP",
                "Almacén de Hospitalización",
                "Material descartable, soluciones parenterales y consumibles para enfermería de piso.",
                "Área de Internación - Piso 3"
            ),
            new(
                "ALM-IMG",
                "Almacén de Imagenología",
                "Medios de contraste, insumos radiológicos y consumibles para ecografía y tomografía.",
                "Servicio de Radiología e Imagen"
            ),
            new(
                "ALM-LIM",
                "Almacén de Limpieza y Ropería",
                "Insumos de desinfección, bioseguridad hospitalaria, aseo y lencería institucional.",
                "Servicios Generales - Sótano 1"
            )
        ];
    }

    private sealed record SeedAlmacen(
        string Codigo,
        string Nombre,
        string? Descripcion,
        string? Ubicacion
    );
}
