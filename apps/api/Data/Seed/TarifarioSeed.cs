using System.Globalization;
using System.Reflection;
using System.Text.Json;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class TarifarioSeed
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var ahora = DateTime.UtcNow;

        var moneda = await EnsureMonedaBobAsync(dbContext, ahora);

        var seedTarifarios = LoadSeedTarifarios();

        var codigos = seedTarifarios.Select(t => t.Codigo).ToArray();

        var existentes = await dbContext.Tarifarios
            .Include(t => t.Detalles)
            .Where(t => codigos.Contains(t.Codigo))
            .ToListAsync();

        var existentesPorCodigo = existentes
            .ToDictionary(t => t.Codigo, StringComparer.OrdinalIgnoreCase);

        var todosServicioCodigos = seedTarifarios
            .SelectMany(t => t.Detalles)
            .Select(d => d.ServicioCodigo)
            .Distinct()
            .ToArray();

        var serviciosPorCodigo = await dbContext.Servicio
            .Where(s => todosServicioCodigos.Contains(s.Codigo))
            .ToDictionaryAsync(s => s.Codigo, StringComparer.OrdinalIgnoreCase);

        foreach (var seed in seedTarifarios)
        {
            if (existentesPorCodigo.TryGetValue(seed.Codigo, out var tarifario))
            {
                MergeDetalles(tarifario, seed, serviciosPorCodigo, ahora);
            }
            else
            {
                tarifario = new Tarifario
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    FechaInicio = ParseDate(seed.FechaInicio),
                    FechaFin = string.IsNullOrEmpty(seed.FechaFin) ? null : ParseDate(seed.FechaFin),
                    MonedaId = moneda.Id,
                    EsPrincipal = seed.EsPrincipal,
                    Activo = true,
                    FechaCreacion = ahora
                };

                foreach (var detalle in seed.Detalles)
                {
                    if (!serviciosPorCodigo.TryGetValue(detalle.ServicioCodigo, out var servicio))
                        continue;

                    tarifario.Detalles.Add(new TarifarioDetalle
                    {
                        ServicioId = servicio.Id,
                        Precio = detalle.Precio,
                        Activo = true,
                        FechaCreacion = ahora
                    });
                }

                dbContext.Tarifarios.Add(tarifario);
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task<Moneda> EnsureMonedaBobAsync(
        AppDbContext dbContext,
        DateTime ahora)
    {
        var moneda = await dbContext.Monedas
            .FirstOrDefaultAsync(m => m.Codigo == "BOB");

        if (moneda is not null)
            return moneda;

        moneda = new Moneda
        {
            Codigo = "BOB",
            Nombre = "Boliviano",
            Simbolo = "Bs",
            Decimales = 2,
            EsBase = true,
            Activo = true,
            FechaCreacion = ahora
        };

        dbContext.Monedas.Add(moneda);
        await dbContext.SaveChangesAsync();

        return moneda;
    }

    private static void MergeDetalles(
        Tarifario tarifario,
        SeedTarifario seed,
        Dictionary<string, Servicio> serviciosPorCodigo,
        DateTime ahora)
    {
        var existentes = tarifario.Detalles
            .ToDictionary(d => d.ServicioId);

        foreach (var detalle in seed.Detalles)
        {
            if (!serviciosPorCodigo.TryGetValue(detalle.ServicioCodigo, out var servicio))
                continue;

            if (existentes.ContainsKey(servicio.Id))
                continue;

            tarifario.Detalles.Add(new TarifarioDetalle
            {
                TarifarioId = tarifario.Id,
                ServicioId = servicio.Id,
                Precio = detalle.Precio,
                Activo = true,
                FechaCreacion = ahora
            });
        }
    }

    private static List<SeedTarifario> LoadSeedTarifarios()
    {
        var assembly = typeof(TarifarioSeed).Assembly;

        var resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("TarifariosSeed.json"))
            ?? throw new InvalidOperationException(
                "No se encontró el recurso embebido TarifariosSeed.json.");

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"No se pudo abrir el recurso embebido {resourceName}.");

        var tarifarios = JsonSerializer.Deserialize<List<SeedTarifario>>(stream, JsonOptions)
            ?? throw new InvalidOperationException(
                "El archivo TarifariosSeed.json no contiene tarifarios válidos.");

        return tarifarios;
    }

    private static DateOnly ParseDate(string value)
    {
        return DateOnly.Parse(value, CultureInfo.InvariantCulture);
    }

    private sealed record SeedTarifario(
        string Codigo,
        string Nombre,
        string? Descripcion,
        string FechaInicio,
        string? FechaFin,
        string MonedaCodigo,
        bool EsPrincipal,
        List<SeedDetalle> Detalles);

    private sealed record SeedDetalle(
        string ServicioCodigo,
        decimal Precio);
}