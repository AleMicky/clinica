using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity;
using Clinica.Api.Modules.Almacenes.Existencia.Entity;
using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity;
using Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;
using Clinica.Api.Modules.Almacenes.Producto.Entity;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class FarmaciaSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1. Obtener almacén central y farmacia central
        var almCentral = await db.Almacenes.FirstOrDefaultAsync(a => a.Codigo == "ALM-CENT");
        var almFarmacia = await db.Almacenes.FirstOrDefaultAsync(a => a.Codigo == "ALM-FARM");

        if (almCentral is null || almFarmacia is null)
        {
            return;
        }

        // 2. Asegurar categoría de Medicamentos
        var catMedicamentos = await db.CategoriasProducto.FirstOrDefaultAsync(c => c.Codigo == "CAT-MED");
        if (catMedicamentos is null)
        {
            catMedicamentos = new CategoriaProducto
            {
                Codigo = "CAT-MED",
                Nombre = "Medicamentos y Fármacos",
                Descripcion = "Medicamentos de uso ambulatorio e internación hospitalaria",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            db.CategoriasProducto.Add(catMedicamentos);
            await db.SaveChangesAsync();
        }

        // 3. Unidad de medida
        var unidadCaja = await db.UnidadesMedida.FirstOrDefaultAsync(u => u.Codigo == "CAJ")
                         ?? await db.UnidadesMedida.FirstOrDefaultAsync(u => u.Codigo == "UNI")
                         ?? await db.UnidadesMedida.FirstOrDefaultAsync();

        if (unidadCaja is null)
        {
            unidadCaja = new UnidadesMedida
            {
                Categoria = "Empaque",
                Codigo = "CAJ",
                Nombre = "Caja",
                Simbolo = "caja",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            db.UnidadesMedida.Add(unidadCaja);
            await db.SaveChangesAsync();
        }

        // 4. Catálogo de Medicamentos
        var catalogo = new[]
        {
            new { Codigo = "MED-001", Nombre = "Paracetamol 500mg Comprimidos", Precio = 15.00m, Costo = 8.00m, Lote = "LOTE-PAR-26A", Venc = new DateOnly(2027, 12, 31), StockCentral = 300m, StockFarm = 100m },
            new { Codigo = "MED-002", Nombre = "Ibuprofeno 400mg Tabletas", Precio = 22.50m, Costo = 12.00m, Lote = "LOTE-IBU-26B", Venc = new DateOnly(2028, 6, 30), StockCentral = 250m, StockFarm = 80m },
            new { Codigo = "MED-003", Nombre = "Amoxicilina 500mg Cápsulas", Precio = 35.00m, Costo = 18.00m, Lote = "LOTE-AMX-26A", Venc = new DateOnly(2027, 10, 15), StockCentral = 200m, StockFarm = 60m },
            new { Codigo = "MED-004", Nombre = "Omeprazol 20mg Cápsulas", Precio = 28.00m, Costo = 14.00m, Lote = "LOTE-OME-26C", Venc = new DateOnly(2028, 3, 20), StockCentral = 180m, StockFarm = 50m },
            new { Codigo = "MED-005", Nombre = "Diclofenaco Sódico 50mg", Precio = 18.00m, Costo = 9.00m, Lote = "LOTE-DIC-26A", Venc = new DateOnly(2027, 8, 25), StockCentral = 220m, StockFarm = 70m },
            new { Codigo = "MED-006", Nombre = "Suero Fisiológico 0.9% 500ml", Precio = 25.00m, Costo = 13.00m, Lote = "LOTE-SUE-26D", Venc = new DateOnly(2028, 1, 10), StockCentral = 150m, StockFarm = 45m }
        };

        var productosCreados = new List<Producto>();

        foreach (var item in catalogo)
        {
            var prod = await db.Productos.FirstOrDefaultAsync(p => p.Codigo == item.Codigo);
            if (prod is null)
            {
                prod = new Producto
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = $"Medicamento esencial: {item.Nombre}",
                    CategoriaProductoId = catMedicamentos.Id,
                    UnidadMedidaId = unidadCaja.Id,
                    ControlaVencimiento = true,
                    PrecioVenta = item.Precio,
                    StockMinimo = 10m,
                    StockMaximo = 500m,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.Productos.Add(prod);
                await db.SaveChangesAsync();
            }

            productosCreados.Add(prod);

            // Asegurar Partida (Lote con vencimiento)
            var partida = await db.PartidasInventario.FirstOrDefaultAsync(p => p.ProductoId == prod.Id && p.NumeroPartida == item.Lote);
            if (partida is null)
            {
                partida = new PartidaInventario
                {
                    ProductoId = prod.Id,
                    NumeroPartida = item.Lote,
                    FechaVencimiento = item.Venc,
                    CostoUnitario = item.Costo,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.PartidasInventario.Add(partida);
                await db.SaveChangesAsync();
            }

            // Asegurar existencia en Farmacia Central
            var exFarmacia = await db.Existencias.FirstOrDefaultAsync(e => e.AlmacenId == almFarmacia.Id && e.ProductoId == prod.Id);
            if (exFarmacia is null)
            {
                exFarmacia = new Existencia
                {
                    AlmacenId = almFarmacia.Id,
                    ProductoId = prod.Id,
                    Cantidad = item.StockFarm,
                    CantidadReservada = 0m,
                    CostoPromedio = item.Costo,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.Existencias.Add(exFarmacia);
                await db.SaveChangesAsync();
            }
            else if (exFarmacia.Cantidad < 10m)
            {
                exFarmacia.Cantidad = item.StockFarm;
                exFarmacia.CostoPromedio = item.Costo;
            }

            // Existencia Partida en Farmacia
            var epFarmacia = await db.ExistenciasPartidas.FirstOrDefaultAsync(ep => ep.ExistenciaId == exFarmacia.Id && ep.PartidaInventarioId == partida.Id);
            if (epFarmacia is null)
            {
                epFarmacia = new ExistenciaPartida
                {
                    ExistenciaId = exFarmacia.Id,
                    PartidaInventarioId = partida.Id,
                    Cantidad = exFarmacia.Cantidad,
                    CantidadReservada = 0m,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.ExistenciasPartidas.Add(epFarmacia);
            }
            else if (epFarmacia.Cantidad < 10m)
            {
                epFarmacia.Cantidad = exFarmacia.Cantidad;
            }

            // Existencia en Almacén Central
            var exCentral = await db.Existencias.FirstOrDefaultAsync(e => e.AlmacenId == almCentral.Id && e.ProductoId == prod.Id);
            if (exCentral is null)
            {
                exCentral = new Existencia
                {
                    AlmacenId = almCentral.Id,
                    ProductoId = prod.Id,
                    Cantidad = item.StockCentral,
                    CantidadReservada = 0m,
                    CostoPromedio = item.Costo,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.Existencias.Add(exCentral);
                await db.SaveChangesAsync();
            }

            var epCentral = await db.ExistenciasPartidas.FirstOrDefaultAsync(ep => ep.ExistenciaId == exCentral.Id && ep.PartidaInventarioId == partida.Id);
            if (epCentral is null)
            {
                epCentral = new ExistenciaPartida
                {
                    ExistenciaId = exCentral.Id,
                    PartidaInventarioId = partida.Id,
                    Cantidad = exCentral.Cantidad,
                    CantidadReservada = 0m,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.ExistenciasPartidas.Add(epCentral);
            }

            await db.SaveChangesAsync();
        }

        // 5. Crear la Transferencia de Prueba de Almacén Central a Farmacia Central
        var numeroTrf = "TRF-FARM-000001";
        var trfExistente = await db.TransferenciasAlmacen.FirstOrDefaultAsync(t => t.Numero == numeroTrf);
        if (trfExistente is null)
        {
            var trf = new TransferenciaAlmacen
            {
                Numero = numeroTrf,
                AlmacenOrigenId = almCentral.Id,
                AlmacenDestinoId = almFarmacia.Id,
                FechaSolicitud = DateTime.UtcNow.AddHours(-4),
                FechaAprobacion = DateTime.UtcNow.AddHours(-3),
                FechaDespacho = DateTime.UtcNow.AddHours(-2),
                FechaRecepcion = DateTime.UtcNow.AddHours(-1),
                Estado = EstadoTransferenciaAlmacen.Recibida,
                Observacion = "Transferencia inicial de abastecimiento a Farmacia Central (Medicamentos de alta rotación)",
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddHours(-4)
            };

            foreach (var prod in productosCreados)
            {
                var cant = prod.Codigo switch
                {
                    "MED-001" => 100m,
                    "MED-002" => 80m,
                    "MED-003" => 60m,
                    "MED-004" => 50m,
                    "MED-005" => 70m,
                    _ => 45m
                };

                trf.Detalles.Add(new TransferenciaAlmacenDetalle
                {
                    ProductoId = prod.Id,
                    CantidadSolicitada = cant,
                    CantidadAprobada = cant,
                    CantidadDespachada = cant,
                    CantidadRecibida = cant,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow.AddHours(-4)
                });
            }

            db.TransferenciasAlmacen.Add(trf);
            await db.SaveChangesAsync();
        }

        // 6. Crear una segunda transferencia en estado "Aprobada" para que el usuario pueda probar el flujo de recepción
        var numeroTrf2 = "TRF-FARM-000002";
        var trf2Existente = await db.TransferenciasAlmacen.FirstOrDefaultAsync(t => t.Numero == numeroTrf2);
        if (trf2Existente is null && productosCreados.Count >= 2)
        {
            var trf2 = new TransferenciaAlmacen
            {
                Numero = numeroTrf2,
                AlmacenOrigenId = almCentral.Id,
                AlmacenDestinoId = almFarmacia.Id,
                FechaSolicitud = DateTime.UtcNow.AddHours(-1),
                FechaAprobacion = DateTime.UtcNow.AddMinutes(-30),
                Estado = EstadoTransferenciaAlmacen.Aprobada,
                Observacion = "Transferencia complementaria para Farmacia Central (Lista para despachar y recibir)",
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddHours(-1)
            };

            trf2.Detalles.Add(new TransferenciaAlmacenDetalle
            {
                ProductoId = productosCreados[0].Id, // Paracetamol
                CantidadSolicitada = 50m,
                CantidadAprobada = 50m,
                CantidadDespachada = 0m,
                CantidadRecibida = 0m,
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddHours(-1)
            });

            trf2.Detalles.Add(new TransferenciaAlmacenDetalle
            {
                ProductoId = productosCreados[1].Id, // Ibuprofeno
                CantidadSolicitada = 30m,
                CantidadAprobada = 30m,
                CantidadDespachada = 0m,
                CantidadRecibida = 0m,
                Activo = true,
                FechaCreacion = DateTime.UtcNow.AddHours(-1)
            });

            db.TransferenciasAlmacen.Add(trf2);
            await db.SaveChangesAsync();
        }
    }
}
