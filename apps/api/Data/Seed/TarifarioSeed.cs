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

        var seedTarifarios = LoadSeedTarifarios();

        var codigos = seedTarifarios.Select(t => t.Codigo).ToArray();

        var existentes = await dbContext.Tarifarios
            .Include(t => t.Detalles)
            .Where(t => codigos.Contains(t.Codigo))
            .ToListAsync();

        var existentesPorCodigo = existentes
            .ToDictionary(t => t.Codigo, StringComparer.OrdinalIgnoreCase);

        // Precarga de monedas para resolver MonedaCodigo por tarifario.
        var monedas = await dbContext.Monedas
            .ToListAsync();
        var monedasPorCodigo = monedas
            .ToDictionary(m => m.Codigo, StringComparer.OrdinalIgnoreCase);

        // El tarifario principal final: el último seed con EsPrincipal.
        SeedTarifario? principalSembrado = null;
        foreach (var seed in seedTarifarios)
        {
            if (seed.EsPrincipal)
                principalSembrado = seed;
        }

        var tarifaPorCodigo =
            new Dictionary<string, Tarifario>(StringComparer.OrdinalIgnoreCase);

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
            var moneda = await ResolveMonedaAsync(
                dbContext, monedasPorCodigo, seed.MonedaCodigo);

            var esPrincipal = ReferenceEquals(seed, principalSembrado);

            if (existentesPorCodigo.TryGetValue(seed.Codigo, out var tarifario))
            {
                tarifario.Nombre = seed.Nombre;
                tarifario.Descripcion = seed.Descripcion;
                tarifario.FechaInicio = ParseDate(seed.FechaInicio);
                tarifario.FechaFin = string.IsNullOrEmpty(seed.FechaFin)
                    ? null
                    : ParseDate(seed.FechaFin);
                tarifario.MonedaId = moneda.Id;
                tarifario.Activo = true;
                tarifario.EsPrincipal = esPrincipal;

                MergeDetalles(tarifario, seed, serviciosPorCodigo);

                tarifaPorCodigo[seed.Codigo] = tarifario;
            }
            else
            {
                tarifario = new Tarifario
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    FechaInicio = ParseDate(seed.FechaInicio),
                    FechaFin = string.IsNullOrEmpty(seed.FechaFin)
                        ? null
                        : ParseDate(seed.FechaFin),
                    MonedaId = moneda.Id,
                    EsPrincipal = esPrincipal,
                    Activo = true
                };

                foreach (var detalle in seed.Detalles)
                {
                    if (!serviciosPorCodigo.TryGetValue(
                            detalle.ServicioCodigo,
                            out var servicio))
                        continue;

                    tarifario.Detalles.Add(new TarifarioDetalle
                    {
                        ServicioId = servicio.Id,
                        Precio = detalle.Precio,
                        Activo = true
                    });
                }

                dbContext.Tarifarios.Add(tarifario);
                tarifaPorCodigo[seed.Codigo] = tarifario;
            }
        }

        await dbContext.SaveChangesAsync();

        // Garantizar un único tarifario principal: demotar los demás.
        if (principalSembrado is not null &&
            tarifaPorCodigo.TryGetValue(
                principalSembrado.Codigo,
                out var principal))
        {
            var otros = await dbContext.Tarifarios
                .Where(x => x.EsPrincipal && x.Id != principal.Id)
                .ToListAsync();

            if (otros.Count > 0 || !principal.EsPrincipal)
            {
                foreach (var otro in otros)
                {
                    otro.EsPrincipal = false;
                }

                principal.EsPrincipal = true;

                await dbContext.SaveChangesAsync();
            }
        }
    }

    private static async Task<Moneda> ResolveMonedaAsync(
        AppDbContext dbContext,
        Dictionary<string, Moneda> monedasPorCodigo,
        string? monedaCodigo)
    {
        var codigo = string.IsNullOrWhiteSpace(monedaCodigo)
            ? "BOB"
            : monedaCodigo.Trim();

        if (monedasPorCodigo.TryGetValue(codigo, out var moneda))
            return moneda;

        moneda = new Moneda
        {
            Codigo = codigo,
            Nombre = codigo,
            Simbolo = codigo,
            Decimales = 2,
            EsBase = false,
            Activo = true
        };

        dbContext.Monedas.Add(moneda);
        monedasPorCodigo[codigo] = moneda;

        await dbContext.SaveChangesAsync();

        return moneda;
    }

    private static void MergeDetalles(
        Tarifario tarifario,
        SeedTarifario seed,
        Dictionary<string, Servicio> serviciosPorCodigo)
    {
        var existentes = tarifario.Detalles
            .ToDictionary(d => d.ServicioId);

        foreach (var detalle in seed.Detalles)
        {
            if (!serviciosPorCodigo.TryGetValue(
                    detalle.ServicioCodigo,
                    out var servicio))
                continue;

            if (existentes.ContainsKey(servicio.Id))
                continue;

            tarifario.Detalles.Add(new TarifarioDetalle
            {
                TarifarioId = tarifario.Id,
                ServicioId = servicio.Id,
                Precio = detalle.Precio,
                Activo = true
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