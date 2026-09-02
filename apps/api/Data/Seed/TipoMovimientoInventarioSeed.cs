using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class TipoMovimientoInventarioSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedTipos = BuildSeedTiposMovimiento();

        var codigos = seedTipos
            .Select(t => t.Codigo)
            .ToArray();

        var existentes = await dbContext.TiposMovimientoInventario
            .Where(t => codigos.Contains(t.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                t => t.Codigo,
                StringComparer.OrdinalIgnoreCase
            );

        var faltaGuardar = false;

        foreach (var seed in seedTipos)
        {
            if (porCodigo.TryGetValue(seed.Codigo, out var existente))
            {
                // Si ya existe pero le falta descripción o el nombre es básico, lo sincronizamos si está activo
                if (string.IsNullOrWhiteSpace(existente.Descripcion) && !string.IsNullOrWhiteSpace(seed.Descripcion))
                {
                    existente.Descripcion = seed.Descripcion;
                    faltaGuardar = true;
                }
                continue;
            }

            dbContext.TiposMovimientoInventario.Add(new TipoMovimientoInventario
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                Naturaleza = seed.Naturaleza,
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

    private static List<SeedTipoMovimiento> BuildSeedTiposMovimiento()
    {
        return
        [
            // ==========================================
            // ENTRADAS (Ingresos de Stock)
            // ==========================================
            new(
                "COMPRA",
                "Ingreso por Compra",
                "Entrada de insumos, medicamentos o materiales por adquisición a proveedores.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "RECEPCION_COMPRA",
                "Recepción de Mercadería",
                "Ingreso formal y verificación de bienes provenientes de órdenes de compra.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "AJUSTE_POSITIVO",
                "Ajuste Positivo de Inventario",
                "Ingreso de stock por sobrante o regularización administrativa de existencias.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "AJUSTE_INV_ENTRADA",
                "Ajuste Positivo por Inventario Físico",
                "Regularización de sobrantes detectados durante la toma de inventario físico.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "TRANSFERENCIA_ENTRADA",
                "Ingreso por Transferencia",
                "Entrada de productos recibidos desde otro almacén o sucursal.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "INVENTARIO_INICIAL",
                "Inventario Inicial",
                "Carga de saldos de apertura y puesta en marcha del inventario.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "DEVOLUCION_PACIENTE",
                "Devolución de Paciente",
                "Reingreso de medicamentos o insumos no utilizados devueltos por pacientes o servicios.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "DEVOLUCION_INTERNA",
                "Devolución Interna de Servicio",
                "Reingreso de insumos no consumidos en quirófanos, salas o consultorios.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "DONACION_ENTRADA",
                "Ingreso por Donación",
                "Recepción e ingreso al stock de medicamentos o insumos recibidos por donación.",
                NaturalezaMovimiento.Entrada
            ),
            new(
                "REINGRESO",
                "Reingreso a Almacén",
                "Reincorporación general de existencias al stock disponible.",
                NaturalezaMovimiento.Entrada
            ),

            // ==========================================
            // SALIDAS (Egresos de Stock)
            // ==========================================
            new(
                "AJUSTE_NEGATIVO",
                "Ajuste Negativo de Inventario",
                "Salida de stock por faltante o regularización administrativa de existencias.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "AJUSTE_INV_SALIDA",
                "Ajuste Negativo por Inventario Físico",
                "Regularización de faltantes detectados durante la toma de inventario físico.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "TRANSFERENCIA_SALIDA",
                "Salida por Transferencia",
                "Salida de productos despachados hacia otro almacén o sucursal.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "CONSUMO",
                "Consumo Interno",
                "Despacho de medicamentos, insumos o reactivos para uso operativo en áreas de la clínica.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "VENCIMIENTO",
                "Baja por Vencimiento",
                "Descarte y baja definitiva de productos o fármacos con fecha de caducidad expirada.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "DAÑO",
                "Baja por Daño o Deterioro",
                "Baja de existencias rotas, inutilizables o con empaque comprometido.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "DANIO",
                "Baja por Daño (Sin tilde)",
                "Baja de existencias por daño físico o manipulación inadecuada.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "MERMA",
                "Baja por Merma",
                "Baja de stock por evaporación, fraccionamiento o merma operativa.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "PERDIDA_EXTRAVIO",
                "Baja por Pérdida o Extravío",
                "Salida de stock por extravío, pérdida o discrepancia no justificada.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "DISPENSACION_PACIENTE",
                "Dispensación a Paciente",
                "Salida directa de medicamentos o insumos aplicados en la atención del paciente.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "DEVOLUCION_PROVEEDOR",
                "Devolución a Proveedor",
                "Salida de productos rechazados o devueltos al proveedor por fallas o inconformidad.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "MUESTRA_MEDICA",
                "Salida por Muestra Médica",
                "Entrega controlada de medicamentos o insumos para demostración médica o ensayos.",
                NaturalezaMovimiento.Salida
            ),
            new(
                "DESPACHO_VENTA",
                "Salida por Venta Directa",
                "Egreso de medicamentos o insumos comercializados en farmacia o botiquín.",
                NaturalezaMovimiento.Salida
            )
        ];
    }

    private sealed record SeedTipoMovimiento(
        string Codigo,
        string Nombre,
        string? Descripcion,
        NaturalezaMovimiento Naturaleza
    );
}
