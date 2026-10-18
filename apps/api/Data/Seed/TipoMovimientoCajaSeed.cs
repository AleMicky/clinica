using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class TipoMovimientoCajaSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var tiposDef = new[]
        {
            new
            {
                Codigo = "ING",
                Nombre = "Ingreso a Caja",
                Descripcion = "Entrada o reposición de fondos a la caja",
                Naturaleza = "ENTRADA",
                Conceptos = new[]
                {
                    new { Codigo = "ING-REP", Nombre = "Reposición de Caja Chica", Descripcion = "Reposición o recarga de fondos" },
                    new { Codigo = "ING-AJU", Nombre = "Ajuste Positivo de Caja", Descripcion = "Ajuste de sobrante o regularización" },
                    new { Codigo = "ING-OTR", Nombre = "Otros Ingresos", Descripcion = "Otros ingresos varios de caja" }
                }
            },
            new
            {
                Codigo = "EGR",
                Nombre = "Egreso de Caja",
                Descripcion = "Salida o retiro de fondos de la caja",
                Naturaleza = "SALIDA",
                Conceptos = new[]
                {
                    new { Codigo = "EGR-GAS", Nombre = "Gastos Operativos Menores", Descripcion = "Pagos de mensajería, útiles, transportes menores" },
                    new { Codigo = "EGR-RET", Nombre = "Retiro / Remesa de Efectivo", Descripcion = "Retiro de efectivo para custodia o depósito" },
                    new { Codigo = "EGR-DEV", Nombre = "Devolución / Reembolso", Descripcion = "Devolución o reembolso a pacientes/clientes" },
                    new { Codigo = "EGR-AJU", Nombre = "Ajuste Negativo de Caja", Descripcion = "Ajuste de faltante o regularización" },
                    new { Codigo = "EGR-OTR", Nombre = "Otros Egresos", Descripcion = "Otros egresos varios de caja" }
                }
            }
        };

        var codigosTipos = tiposDef.Select(t => t.Codigo).ToArray();
        var tiposExistentes = await dbContext.TiposMovimientoCaja
            .Include(t => t.Conceptos)
            .Where(t => codigosTipos.Contains(t.Codigo))
            .ToListAsync();

        var tiposPorCodigo = tiposExistentes.ToDictionary(t => t.Codigo, StringComparer.OrdinalIgnoreCase);

        var cambios = false;

        foreach (var def in tiposDef)
        {
            if (!tiposPorCodigo.TryGetValue(def.Codigo, out var tipo))
            {
                tipo = new TipoMovimientoCaja
                {
                    Codigo = def.Codigo,
                    Nombre = def.Nombre,
                    Descripcion = def.Descripcion,
                    Naturaleza = def.Naturaleza,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                dbContext.TiposMovimientoCaja.Add(tipo);
                tiposPorCodigo[def.Codigo] = tipo;
                cambios = true;
            }

            var conceptosPorCodigo = tipo.Conceptos.ToDictionary(c => c.Codigo, StringComparer.OrdinalIgnoreCase);

            foreach (var concDef in def.Conceptos)
            {
                if (!conceptosPorCodigo.ContainsKey(concDef.Codigo))
                {
                    tipo.Conceptos.Add(new ConceptoMovimientoCaja
                    {
                        Codigo = concDef.Codigo,
                        Nombre = concDef.Nombre,
                        Descripcion = concDef.Descripcion,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                    cambios = true;
                }
            }
        }

        if (cambios)
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
