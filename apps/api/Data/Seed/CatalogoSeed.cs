using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class CatalogoSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedCatalogos = BuildSeedCatalogos();

        var codigos = seedCatalogos
            .Select(c => c.Codigo)
            .ToArray();

        var existingGrupos = await dbContext.CatalogosGrupos
            .Include(g => g.Items)
            .Where(g => codigos.Contains(g.Codigo))
            .ToListAsync();

        var existingByCodigo = existingGrupos
            .ToDictionary(g => g.Codigo, StringComparer.OrdinalIgnoreCase);

        foreach (var seed in seedCatalogos)
        {
            if (existingByCodigo.TryGetValue(seed.Codigo, out var existing))
            {
                MergeItems(existing, seed.Items);
            }
            else
            {
                var grupo = new CatalogoGrupo
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                foreach (var seedItem in seed.Items)
                {
                    grupo.Items.Add(new CatalogoItem
                    {
                        Valor = seedItem.Valor,
                        Nombre = seedItem.Nombre,
                        Orden = seedItem.Orden,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }

                dbContext.CatalogosGrupos.Add(grupo);
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static void MergeItems(CatalogoGrupo grupo, List<SeedItem> seedItems)
    {
        var existingValores = grupo.Items
            .Select(i => i.Valor)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var seedItem in seedItems)
        {
            if (existingValores.Contains(seedItem.Valor))
                continue;

            grupo.Items.Add(new CatalogoItem
            {
                CatalogoGrupoId = grupo.Id,
                Valor = seedItem.Valor,
                Nombre = seedItem.Nombre,
                Orden = seedItem.Orden,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            });
        }
    }

    private static List<SeedCatalogo> BuildSeedCatalogos()
    {
        return
        [
            new SeedCatalogo(
                "GENERO",
                "Género",
                "Género de la persona",
                [
                    new SeedItem("M", "Masculino", 1),
                    new SeedItem("F", "Femenino", 2)
                ]),

            new SeedCatalogo(
                "TIPO_DOCUMENTO",
                "Tipo de Documento",
                "Tipos de documento de identidad",
                [
                    new SeedItem("CI", "Cédula de Identidad", 1),
                    new SeedItem("PASAPORTE", "Pasaporte", 2),
                    new SeedItem("NIT", "NIT", 3),
                    new SeedItem("EXTRANJERO", "Documento Extranjero", 4)
                ]),

            new SeedCatalogo(
                "EXTENSION_BOLIVIA",
                "Extensiones de Bolivia",
                "Departamentos de Bolivia",
                [
                    new SeedItem("BN", "Beni", 1),
                    new SeedItem("CH", "Chuquisaca", 2),
                    new SeedItem("CB", "Cochabamba", 3),
                    new SeedItem("LP", "La Paz", 4),
                    new SeedItem("OR", "Oruro", 5),
                    new SeedItem("PD", "Pando", 6),
                    new SeedItem("PT", "Potosí", 7),
                    new SeedItem("SC", "Santa Cruz", 8),
                    new SeedItem("TJ", "Tarija", 9)
                ]),

            new SeedCatalogo(
                "ESTADO_CIVIL",
                "Estado Civil",
                "Estado civil de la persona",
                [
                    new SeedItem("SOLTERO", "Soltero/a", 1),
                    new SeedItem("CASADO", "Casado/a", 2),
                    new SeedItem("CONVIVIENTE", "Conviviente", 3),
                    new SeedItem("DIVORCIADO", "Divorciado/a", 4),
                    new SeedItem("VIUDO", "Viudo/a", 5)
                ])
        ];
    }

    private sealed record SeedCatalogo(
        string Codigo,
        string Nombre,
        string Descripcion,
        List<SeedItem> Items);

    private sealed record SeedItem(
        string Valor,
        string Nombre,
        int Orden);
}