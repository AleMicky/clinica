using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity;
using Clinica.Api.Modules.Almacenes.Existencia.Entity;
using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity;
using Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;
using Clinica.Api.Modules.Almacenes.Producto.Entity;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Modules.Quirofano.Cirugia.Entity;
using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class QuirofanoSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1. Obtener almacén de quirófano
        var almQui = await db.Almacenes.FirstOrDefaultAsync(a => a.Codigo == "ALM-QUI");
        if (almQui is null)
        {
            return;
        }

        // 2. Asegurar categoría de Material Quirúrgico
        var catQui = await db.CategoriasProducto.FirstOrDefaultAsync(c => c.Codigo == "CAT-QUI");
        if (catQui is null)
        {
            catQui = new CategoriaProducto
            {
                Codigo = "CAT-QUI",
                Nombre = "Material e Insumos de Quirófano",
                Descripcion = "Material estéril, suturas, anestésicos e instrumental para bloque quirúrgico",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            db.CategoriasProducto.Add(catQui);
            await db.SaveChangesAsync();
        }

        // 3. Unidad de medida
        var unidadPieza = await db.UnidadesMedida.FirstOrDefaultAsync(u => u.Codigo == "UNI" || u.Codigo == "PZA")
                          ?? await db.UnidadesMedida.FirstOrDefaultAsync();

        if (unidadPieza is null)
        {
            return;
        }

        // 4. Catálogo de Insumos Quirúrgicos
        var catalogo = new[]
        {
            new { Codigo = "QUI-001", Nombre = "Sutura Vicryl 2-0 con Aguja Curva", Precio = 45.00m, Costo = 25.00m, Lote = "LOT-VIC-2026A", Venc = new DateOnly(2028, 5, 20), Stock = 120m },
            new { Codigo = "QUI-002", Nombre = "Sutura Seda Negra 3-0", Precio = 30.00m, Costo = 16.00m, Lote = "LOT-SED-2026B", Venc = new DateOnly(2028, 8, 15), Stock = 100m },
            new { Codigo = "QUI-003", Nombre = "Propofol 1% 20ml Ampolla", Precio = 65.00m, Costo = 38.00m, Lote = "LOT-PRO-2026C", Venc = new DateOnly(2027, 11, 30), Stock = 80m },
            new { Codigo = "QUI-004", Nombre = "Fentanilo 0.5mg / 10ml Inyectable", Precio = 55.00m, Costo = 30.00m, Lote = "LOT-FEN-2026A", Venc = new DateOnly(2027, 9, 10), Stock = 70m },
            new { Codigo = "QUI-005", Nombre = "Guantes Quirúrgicos Estériles 7.5", Precio = 12.00m, Costo = 6.50m, Lote = "LOT-GUA-2026D", Venc = new DateOnly(2029, 1, 1), Stock = 250m },
            new { Codigo = "QUI-006", Nombre = "Gasas Radiopacas Estériles x 10", Precio = 20.00m, Costo = 10.00m, Lote = "LOT-GAS-2026A", Venc = new DateOnly(2029, 4, 15), Stock = 150m },
            new { Codigo = "QUI-007", Nombre = "Hoja de Bisturí N° 15 Estéril", Precio = 8.00m, Costo = 4.00m, Lote = "LOT-BIS-2026E", Venc = new DateOnly(2029, 6, 30), Stock = 180m },
            new { Codigo = "QUI-008", Nombre = "Clorhexidina Antiséptica 2% 500ml", Precio = 35.00m, Costo = 18.00m, Lote = "LOT-CLO-2026B", Venc = new DateOnly(2027, 12, 1), Stock = 60m }
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
                    Descripcion = $"Insumo quirúrgico especializado: {item.Nombre}",
                    CategoriaProductoId = catQui.Id,
                    UnidadMedidaId = unidadPieza.Id,
                    ControlaVencimiento = true,
                    PrecioVenta = item.Precio,
                    StockMinimo = 15m,
                    StockMaximo = 400m,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.Productos.Add(prod);
                await db.SaveChangesAsync();
            }

            productosCreados.Add(prod);

            // Partida / Lote
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

            // Existencia en ALM-QUI
            var existencia = await db.Existencias.FirstOrDefaultAsync(e => e.AlmacenId == almQui.Id && e.ProductoId == prod.Id);
            if (existencia is null)
            {
                existencia = new Existencia
                {
                    AlmacenId = almQui.Id,
                    ProductoId = prod.Id,
                    Cantidad = item.Stock,
                    CantidadReservada = 0m,
                    CostoPromedio = item.Costo,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.Existencias.Add(existencia);
                await db.SaveChangesAsync();
            }

            var ep = await db.ExistenciasPartidas.FirstOrDefaultAsync(x => x.ExistenciaId == existencia.Id && x.PartidaInventarioId == partida.Id);
            if (ep is null)
            {
                ep = new ExistenciaPartida
                {
                    ExistenciaId = existencia.Id,
                    PartidaInventarioId = partida.Id,
                    Cantidad = existencia.Cantidad,
                    CantidadReservada = 0m,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };
                db.ExistenciasPartidas.Add(ep);
            }

            await db.SaveChangesAsync();
        }

        // 5. Cirugía de prueba si existen médicos y pacientes
        var cirujano = await db.Medicos.FirstOrDefaultAsync(m => m.Activo);
        var paciente = await db.Pacientes.FirstOrDefaultAsync(p => p.Activo);
        var admision = await db.Admisiones.FirstOrDefaultAsync(a => a.Activo);

        if (cirujano != null && paciente != null)
        {
            var cirExistente = await db.Cirugias.FirstOrDefaultAsync(c => c.Numero == "CIR-2026-000001");
            if (cirExistente is null)
            {
                var cirugia = new Cirugia
                {
                    Numero = "CIR-2026-000001",
                    Tipo = TipoCirugia.Programada,
                    Estado = EstadoCirugia.Programada,
                    TipoAnestesia = TipoAnestesia.General,
                    AdmisionId = admision?.Id,
                    PacienteId = paciente.Id,
                    CirujanoPrincipalId = cirujano.Id,
                    SalaOperaciones = "Quirófano 1 - Central",
                    ProcedimientoQuirurgico = "Apendicectomía Laparoscópica",
                    DiagnosticoPreOperatorio = "Apendicitis Aguda (Fase II Flegmonosa)",
                    FechaProgramada = DateTime.UtcNow.AddHours(2),
                    AlmacenId = almQui.Id,
                    Instrumentista = "Lic. Carmen Mendoza",
                    Circulante = "Enf. Roberto Flores",
                    Observaciones = "Paciente en ayunas con valoración pre-anestésica aprobada.",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                if (productosCreados.Count >= 4)
                {
                    cirugia.GastosMateriales.Add(new CirugiaGastoMaterial
                    {
                        ProductoId = productosCreados[0].Id, // Vicryl
                        Cantidad = 2m,
                        CostoUnitario = productosCreados[0].PrecioVenta,
                        PrecioUnitario = productosCreados[0].PrecioVenta,
                        MomentoQuirurgico = "Sutura muñón y pared",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });

                    cirugia.GastosMateriales.Add(new CirugiaGastoMaterial
                    {
                        ProductoId = productosCreados[2].Id, // Propofol
                        Cantidad = 1m,
                        CostoUnitario = productosCreados[2].PrecioVenta,
                        PrecioUnitario = productosCreados[2].PrecioVenta,
                        MomentoQuirurgico = "Inducción anestésica",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });

                    cirugia.GastosMateriales.Add(new CirugiaGastoMaterial
                    {
                        ProductoId = productosCreados[4].Id, // Guantes
                        Cantidad = 3m,
                        CostoUnitario = productosCreados[4].PrecioVenta,
                        PrecioUnitario = productosCreados[4].PrecioVenta,
                        MomentoQuirurgico = "Vestimenta equipo quirúrgico",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }

                db.Cirugias.Add(cirugia);
                await db.SaveChangesAsync();
            }

            var cir2Existente = await db.Cirugias.FirstOrDefaultAsync(c => c.Numero == "CIR-2026-000002");
            if (cir2Existente is null)
            {
                var cirugia2 = new Cirugia
                {
                    Numero = "CIR-2026-000002",
                    Tipo = TipoCirugia.Urgencia,
                    Estado = EstadoCirugia.EnCurso,
                    TipoAnestesia = TipoAnestesia.General,
                    AdmisionId = admision?.Id,
                    PacienteId = paciente.Id,
                    CirujanoPrincipalId = cirujano.Id,
                    SalaOperaciones = "Quirófano 2 - Laparoscópico",
                    ProcedimientoQuirurgico = "Colecistectomía Laparoscópica",
                    DiagnosticoPreOperatorio = "Colecistitis Litiásica Aguda",
                    FechaProgramada = DateTime.UtcNow.AddMinutes(-40),
                    FechaInicio = DateTime.UtcNow.AddMinutes(-30),
                    AlmacenId = almQui.Id,
                    Instrumentista = "Lic. Andrea Vargas",
                    Circulante = "Enf. Mario Suárez",
                    Observaciones = "En tiempo quirúrgico principal - colocación de trócares.",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                if (productosCreados.Count >= 2)
                {
                    cirugia2.GastosMateriales.Add(new CirugiaGastoMaterial
                    {
                        ProductoId = productosCreados[1].Id, // Seda
                        Cantidad = 1m,
                        CostoUnitario = productosCreados[1].PrecioVenta,
                        PrecioUnitario = productosCreados[1].PrecioVenta,
                        MomentoQuirurgico = "Hemostasia",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }

                db.Cirugias.Add(cirugia2);
                await db.SaveChangesAsync();
            }
        }
    }
}
