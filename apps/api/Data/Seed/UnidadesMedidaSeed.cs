using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class UnidadesMedidaSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedUnidades = BuildSeedUnidades();

        var codigos = seedUnidades
            .Select(u => u.Codigo)
            .ToArray();

        var existentes = await dbContext.UnidadesMedida
            .Where(u => codigos.Contains(u.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                u => u.Codigo,
                StringComparer.OrdinalIgnoreCase
            );

        var faltaGuardar = false;

        foreach (var seed in seedUnidades)
        {
            if (porCodigo.TryGetValue(seed.Codigo, out var existente))
            {
                if (existente.Nombre != seed.Nombre || existente.Simbolo != seed.Simbolo || existente.Categoria != seed.Categoria)
                {
                    existente.Nombre = seed.Nombre;
                    existente.Simbolo = seed.Simbolo;
                    existente.Categoria = seed.Categoria;
                    faltaGuardar = true;
                }
                continue;
            }

            dbContext.UnidadesMedida.Add(new UnidadesMedida
            {
                Categoria = seed.Categoria,
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Simbolo = seed.Simbolo,
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

    private static List<SeedUnidadMedida> BuildSeedUnidades()
    {
        return
        [
            // ==========================================
            // UNIDAD / CONTEO
            // ==========================================
            new("Unidad / Conteo", "UND", "Unidad", "und"),
            new("Unidad / Conteo", "PZA", "Pieza", "pza"),
            new("Unidad / Conteo", "PAR", "Par", "par"),

            // ==========================================
            // PRESENTACIÓN / EMPAQUE FARMACÉUTICO
            // ==========================================
            new("Presentación / Empaque", "CAJ", "Caja", "caja"),
            new("Presentación / Empaque", "FCO", "Frasco", "fco"),
            new("Presentación / Empaque", "AMP", "Ampolla / Vial", "amp"),
            new("Presentación / Empaque", "BLI", "Blíster", "blíster"),
            new("Presentación / Empaque", "TUB", "Tubo", "tubo"),
            new("Presentación / Empaque", "SOB", "Sobre / Sachet", "sobre"),
            new("Presentación / Empaque", "BOL", "Bolsa", "bolsa"),
            new("Presentación / Empaque", "KIT", "Kit / Set Quirúrgico", "kit"),
            new("Presentación / Empaque", "ROL", "Rollo", "rollo"),
            new("Presentación / Empaque", "PAQ", "Paquete", "paq"),

            // ==========================================
            // VOLUMEN Y CAPACIDAD
            // ==========================================
            new("Volumen", "ML", "Mililitro", "ml"),
            new("Volumen", "L", "Litro", "l"),
            new("Volumen", "CC", "Centímetro Cúbico", "cc"),
            new("Volumen", "GOT", "Gotas", "gts"),

            // ==========================================
            // MASA Y PESO
            // ==========================================
            new("Masa / Peso", "MG", "Miligramo", "mg"),
            new("Masa / Peso", "G", "Gramo", "g"),
            new("Masa / Peso", "KG", "Kilogramo", "kg"),
            new("Masa / Peso", "MCG", "Microgramo", "mcg"),

            // ==========================================
            // DOSIFICACIÓN / CLÍNICO
            // ==========================================
            new("Dosificación", "UI", "Unidades Internacionales", "UI"),
            new("Dosificación", "DOSIS", "Dosis / Aplicación", "dosis"),

            // ==========================================
            // LONGITUD
            // ==========================================
            new("Longitud", "CM", "Centímetro", "cm"),
            new("Longitud", "M", "Metro", "m"),
            new("Longitud", "MM", "Milímetro", "mm"),

            // ==========================================
            // SERVICIOS / TIEMPO
            // ==========================================
            new("Servicios / Tiempo", "HR", "Hora", "hr"),
            new("Servicios / Tiempo", "SES", "Sesión", "sesión"),
            new("Servicios / Tiempo", "SRV", "Servicio / Procedimiento", "srv")
        ];
    }

    private sealed record SeedUnidadMedida(
        string Categoria,
        string Codigo,
        string Nombre,
        string Simbolo
    );
}
