using Clinica.Api.Modules.Parametros.Banco.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class BancoSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedBancos = BuildSeedBancos();

        var codigos = seedBancos.Select(b => b.Codigo).ToArray();

        var existentes = await dbContext.Bancos
            .Where(b => codigos.Contains(b.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(b => b.Codigo, StringComparer.OrdinalIgnoreCase);

        var faltaGuardar = false;

        foreach (var seed in seedBancos)
        {
            if (porCodigo.ContainsKey(seed.Codigo))
                continue;

            dbContext.Bancos.Add(new Banco
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                NombreCorto = seed.NombreCorto,
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

    private static List<SeedBanco> BuildSeedBancos()
    {
        return
        [
            new SeedBanco("BNB", "Banco Nacional de Bolivia", "BNB"),
            new SeedBanco("BISA", "Banco BISA", "BISA"),
            new SeedBanco("BMSC", "Banco Mercantil Santa Cruz", "MERCANTIL"),
            new SeedBanco("UNION", "Banco Unión", "UNIÓN"),
            new SeedBanco("BCP", "Banco de Crédito de Bolivia", "BCP"),
            new SeedBanco("GANADERO", "Banco Ganadero", "GANADERO"),
            new SeedBanco("ECONOMICO", "Banco Económico", "ECONÓMICO"),
            new SeedBanco("FIE", "Banco FIE", "FIE"),
            new SeedBanco("FORTALEZA", "Banco Fortaleza", "FORTALEZA"),
            new SeedBanco("ECOFUTURO", "Banco PYME Ecofuturo", "ECOFUTURO"),
            new SeedBanco("PRODEM", "Banco PRODEM", "PRODEM"),
            new SeedBanco("SOL", "Banco Sol", "SOL")
        ];
    }

    private sealed record SeedBanco(
        string Codigo,
        string Nombre,
        string NombreCorto);
}
