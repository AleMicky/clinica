using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class RecursosHumanosSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var tiposPorCodigo = await SembrarTiposAreaAsync(dbContext);
        await SembrarAreasAsync(dbContext, tiposPorCodigo);
    }

    private static async Task<Dictionary<string, TipoArea>> SembrarTiposAreaAsync(
        AppDbContext dbContext)
    {
        var seedTipos = BuildSeedTiposArea();

        var codigos = seedTipos.Select(t => t.Codigo).ToArray();

        var existentes = await dbContext.TiposArea
            .Where(t => codigos.Contains(t.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(t => t.Codigo, StringComparer.OrdinalIgnoreCase);

        var faltaGuardar = false;

        foreach (var seed in seedTipos)
        {
            if (!porCodigo.ContainsKey(seed.Codigo))
            {
                var tipo = new TipoArea
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Orden = seed.Orden,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                dbContext.TiposArea.Add(tipo);
                porCodigo[seed.Codigo] = tipo;
                faltaGuardar = true;
            }
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }

        return porCodigo;
    }

    private static async Task SembrarAreasAsync(
        AppDbContext dbContext,
        Dictionary<string, TipoArea> tiposPorCodigo)
    {
        var seedAreas = BuildSeedAreas();

        var todasCodigos = seedAreas.Select(a => a.Codigo).ToArray();

        var existentes = await dbContext.Areas
            .Where(a => todasCodigos.Contains(a.Codigo))
            .ToListAsync();

        var existentesPorCodigo = existentes
            .ToDictionary(a => a.Codigo, StringComparer.OrdinalIgnoreCase);

        var ahora = DateTime.UtcNow;

        var pendientes = seedAreas
            .Where(s => !existentesPorCodigo.ContainsKey(s.Codigo))
            .ToList();

        var creadasPorCodigo = new Dictionary<string, Area>(
            StringComparer.OrdinalIgnoreCase);

        foreach (var existente in existentes)
        {
            creadasPorCodigo[existente.Codigo] = existente;
        }

        var raices = pendientes.Where(a => a.AreaPadreCodigo is null).ToList();
        var subareas = pendientes.Where(a => a.AreaPadreCodigo is not null).ToList();

        foreach (var seed in raices)
        {
            var tipoArea = tiposPorCodigo[seed.TipoAreaCodigo];

            var area = new Area
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                TipoAreaId = tipoArea.Id,
                Activo = true,
                FechaCreacion = ahora
            };

            dbContext.Areas.Add(area);
            creadasPorCodigo[seed.Codigo] = area;
        }

        await dbContext.SaveChangesAsync();

        foreach (var seed in subareas)
        {
            if (!creadasPorCodigo.TryGetValue(
                    seed.AreaPadreCodigo!,
                    out var padre))
            {
                continue;
            }

            var tipoArea = tiposPorCodigo[seed.TipoAreaCodigo];

            var area = new Area
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                TipoAreaId = tipoArea.Id,
                AreaPadreId = padre.Id,
                Activo = true,
                FechaCreacion = ahora
            };

            dbContext.Areas.Add(area);
            creadasPorCodigo[seed.Codigo] = area;
        }

        await dbContext.SaveChangesAsync();
    }

    private static List<SeedTipoArea> BuildSeedTiposArea()
    {
        return
        [
            new SeedTipoArea(
                "ADMIN",
                "Administrativo",
                "Áreas administrativas y de gestión",
                1),
            new SeedTipoArea(
                "MED",
                "Asistencial Médica",
                "Áreas de atención médica directa",
                2),
            new SeedTipoArea(
                "APOYO",
                "Apoyo Diagnóstico",
                "Áreas de apoyo y diagnóstico",
                3),
            new SeedTipoArea(
                "EXTERNA",
                "Áreas Externas",
                "Áreas de relación externa",
                4)
        ];
    }

    private static List<SeedArea> BuildSeedAreas()
    {
        return
        [
            new SeedArea("DIR", "Dirección", "Dirección general", "ADMIN", null),
            new SeedArea("RRHH", "Recursos Humanos", null, "ADMIN", null),
            new SeedArea("FIN", "Contabilidad", null, "ADMIN", null),

            new SeedArea("EMG", "Emergencias", null, "MED", null),
            new SeedArea("PED", "Pediatría", null, "MED", null),
            new SeedArea("CAR", "Cardiología", null, "MED", null),
            new SeedArea("INT", "Hospitalización", null, "MED", null),
            new SeedArea("INT-1", "Hospitalización Piso 1", null, "MED", "INT"),
            new SeedArea("INT-2", "Hospitalización Piso 2", null, "MED", "INT"),

            new SeedArea("LAB", "Laboratorio", null, "APOYO", null),
            new SeedArea("IMG", "Imagenología", null, "APOYO", null),
            new SeedArea("FAR", "Farmacia", null, "APOYO", null),

            new SeedArea("CONV", "Convenios", null, "EXTERNA", null)
        ];
    }

    private sealed record SeedTipoArea(
        string Codigo,
        string Nombre,
        string? Descripcion,
        int Orden);

    private sealed record SeedArea(
        string Codigo,
        string Nombre,
        string? Descripcion,
        string TipoAreaCodigo,
        string? AreaPadreCodigo);
}