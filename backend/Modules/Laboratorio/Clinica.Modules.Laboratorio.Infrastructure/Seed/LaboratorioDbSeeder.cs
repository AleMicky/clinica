using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Laboratorio.Infrastructure.Seed;

public static class LaboratorioDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("LaboratorioDbSeeder");

        var context = services.GetRequiredService<LaboratorioDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context, logger);
        await LaboratorioDemoSeeder.SeedAsync(serviceProvider);

        logger.LogInformation("Migraciones y datos iniciales de Laboratorio aplicados correctamente.");
    }

    private static async Task SeedAsync(LaboratorioDbContext context, ILogger logger)
    {
        await SeedEspecialidadesAsync(context);
        await SeedTiposExamenAsync(context);

        var tipoMuestras = await LoadTipoMuestrasAsync(context);
        if (tipoMuestras.Count == 0)
        {
            logger.LogWarning(
                "No se encontró el catálogo TIPO_MUESTRA. Se omiten pruebas y precios. Ejecute el seed de Parámetros primero.");
            return;
        }

        await SeedPruebasAsync(context, tipoMuestras);
        await SeedPruebaPreciosAsync(context);
        await SeedParametrosAsync(context);
    }

    private static async Task SeedEspecialidadesAsync(LaboratorioDbContext context)
    {
        (string Codigo, string Nombre, string Descripcion, int Orden)[] items =
        [
            ("HEMATO", "Hematología", "Estudios hematológicos y coagulación", 1),
            ("BIOQ", "Bioquímica clínica", "Química sanguínea y metabolitos", 2),
            ("MICRO", "Microbiología", "Cultivos e identificación microbiológica", 3),
            ("INMUNO", "Inmunología", "Serología e inmunoensayos", 4),
            ("URI", "Urianálisis", "Exámenes de orina", 5),
        ];

        foreach (var item in items)
        {
            var exists = await context.Especialidades
                .AnyAsync(x => x.Codigo == item.Codigo);

            if (exists)
                continue;

            context.Especialidades.Add(new Especialidad
            {
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                Descripcion = item.Descripcion,
                Orden = item.Orden,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedTiposExamenAsync(LaboratorioDbContext context)
    {
        (string Codigo, string Nombre, string Descripcion)[] items =
        [
            ("RUTINA", "Examen de rutina", "Pruebas de laboratorio de rutina"),
            ("ESPECIAL", "Examen especial", "Pruebas especializadas"),
            ("URGENTE", "Examen urgente", "Pruebas con prioridad urgente"),
            ("PERFIL", "Perfil / panel", "Conjuntos de pruebas relacionadas"),
        ];

        foreach (var item in items)
        {
            var exists = await context.TiposExamen
                .AnyAsync(x => x.Codigo == item.Codigo);

            if (exists)
                continue;

            context.TiposExamen.Add(new TipoExamen
            {
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                Descripcion = item.Descripcion,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Guid>> LoadTipoMuestrasAsync(
        LaboratorioDbContext context)
    {
        var grupoId = await context.Set<CatalogoGrupo>()
            .AsNoTracking()
            .Where(x => x.Codigo == "TIPO_MUESTRA")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (grupoId == Guid.Empty)
            return [];

        return await context.Set<CatalogoItem>()
            .AsNoTracking()
            .Where(x => x.CatalogoGrupoId == grupoId)
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);
    }

    private static async Task SeedPruebasAsync(
        LaboratorioDbContext context,
        IReadOnlyDictionary<string, Guid> tipoMuestras)
    {
        var especialidades = await context.Especialidades
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        var tiposExamen = await context.TiposExamen
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        (
            string Codigo,
            string Nombre,
            string Especialidad,
            string TipoExamen,
            string TipoMuestra,
            bool RequiereAyuno,
            int? HorasAyuno,
            bool EsDerivable
        )[] items =
        [
            ("GLU", "Glucosa", "BIOQ", "RUTINA", "SUERO", true, 8, false),
            ("CREA", "Creatinina", "BIOQ", "RUTINA", "SUERO", false, 0, false),
            ("COL", "Colesterol total", "BIOQ", "RUTINA", "SUERO", true, 12, false),
            ("TRIG", "Triglicéridos", "BIOQ", "RUTINA", "SUERO", true, 12, false),
            ("HB", "Hemoglobina", "HEMATO", "RUTINA", "SANGRE", false, 0, false),
            ("HTO", "Hematocrito", "HEMATO", "RUTINA", "SANGRE", false, 0, false),
            ("LEU", "Recuento de leucocitos", "HEMATO", "RUTINA", "SANGRE", false, 0, false),
            ("EGO", "Examen general de orina", "URI", "RUTINA", "ORINA", false, 0, false),
            ("TSH", "Hormona estimulante de tiroides", "INMUNO", "ESPECIAL", "SUERO", false, 0, true),
            ("CULT_ORI", "Urocultivo", "MICRO", "ESPECIAL", "ORINA", false, 0, true),
        ];

        foreach (var item in items)
        {
            var exists = await context.Pruebas
                .AnyAsync(x => x.Codigo == item.Codigo);

            if (exists)
                continue;

            if (!especialidades.TryGetValue(item.Especialidad, out var especialidadId) ||
                !tiposExamen.TryGetValue(item.TipoExamen, out var tipoExamenId) ||
                !tipoMuestras.TryGetValue(item.TipoMuestra, out var tipoMuestraId))
            {
                continue;
            }

            context.Pruebas.Add(new Prueba
            {
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                EspecialidadId = especialidadId,
                TipoExamenId = tipoExamenId,
                TipoMuestraId = tipoMuestraId,
                RequiereAyuno = item.RequiereAyuno,
                HorasAyuno = item.RequiereAyuno ? item.HorasAyuno : null,
                EsDerivable = item.EsDerivable,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedParametrosAsync(LaboratorioDbContext context)
    {
        var unidades = await context.Set<UnidadesMedida>()
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        unidades.TryGetValue("MG_DL", out var mgDl);
        unidades.TryGetValue("G_DL", out var gDl);
        unidades.TryGetValue("PCT", out var pct);
        unidades.TryGetValue("U_L", out var uL);

        var pruebas = await context.Pruebas
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        (string PruebaCodigo, string Codigo, string Nombre, string TipoDato, Guid? UnidadId, int Orden)[] items =
        [
            ("GLU", "GLU_VAL", "Glucosa en suero", "NUMERICO", mgDl == Guid.Empty ? null : mgDl, 1),
            ("CREA", "CREA_VAL", "Creatinina en suero", "NUMERICO", mgDl == Guid.Empty ? null : mgDl, 1),
            ("COL", "COL_VAL", "Colesterol total", "NUMERICO", mgDl == Guid.Empty ? null : mgDl, 1),
            ("TRIG", "TRIG_VAL", "Triglicéridos", "NUMERICO", mgDl == Guid.Empty ? null : mgDl, 1),
            ("HB", "HB_VAL", "Hemoglobina", "NUMERICO", gDl == Guid.Empty ? null : gDl, 1),
            ("HTO", "HTO_VAL", "Hematocrito", "NUMERICO", pct == Guid.Empty ? null : pct, 1),
            ("LEU", "LEU_VAL", "Leucocitos", "NUMERICO", null, 1),
            ("EGO", "EGO_ASPECTO", "Aspecto", "TEXTO", null, 1),
            ("EGO", "EGO_PH", "pH", "NUMERICO", null, 2),
            ("TSH", "TSH_VAL", "TSH", "NUMERICO", uL == Guid.Empty ? null : uL, 1),
        ];

        foreach (var item in items)
        {
            if (!pruebas.TryGetValue(item.PruebaCodigo, out var pruebaId))
                continue;

            var exists = await context.Parametros
                .AnyAsync(x => x.PruebaId == pruebaId && x.Codigo == item.Codigo);

            if (exists)
                continue;

            context.Parametros.Add(new Parametro
            {
                PruebaId = pruebaId,
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                TipoDato = item.TipoDato,
                UnidadMedidaId = item.UnidadId,
                Orden = item.Orden,
                Activo = true,
            });
        }

        await context.SaveChangesAsync();
        await SeedValoresReferenciaAsync(context);
    }

    private static async Task SeedValoresReferenciaAsync(LaboratorioDbContext context)
    {
        var parametros = await context.Parametros
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        (string ParamCodigo, decimal? Min, decimal? Max, string? Texto)[] items =
        [
            ("GLU_VAL", 70m, 100m, null),
            ("CREA_VAL", 0.6m, 1.3m, null),
            ("COL_VAL", null, 200m, null),
            ("TRIG_VAL", null, 150m, null),
            ("HB_VAL", 12m, 17m, null),
            ("HTO_VAL", 36m, 50m, null),
            ("LEU_VAL", 4000m, 11000m, null),
            ("EGO_ASPECTO", null, null, "Amarillo claro"),
            ("EGO_PH", 4.5m, 8.0m, null),
            ("TSH_VAL", 0.4m, 4.0m, null),
        ];

        foreach (var item in items)
        {
            if (!parametros.TryGetValue(item.ParamCodigo, out var parametroId))
                continue;

            var exists = await context.ValoresReferencia
                .AnyAsync(x => x.ParametroId == parametroId && x.Activo);

            if (exists)
                continue;

            context.ValoresReferencia.Add(new ValorReferencia
            {
                ParametroId = parametroId,
                ValorMin = item.Min,
                ValorMax = item.Max,
                ValorTexto = item.Texto,
                Activo = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPruebaPreciosAsync(LaboratorioDbContext context)
    {
        var pruebas = await context.Pruebas
            .AsNoTracking()
            .Select(x => new { x.Id, x.Codigo })
            .ToListAsync();

        if (pruebas.Count == 0)
            return;

        var preciosPorCodigo = new Dictionary<string, (decimal Facturado, decimal Lab, decimal Derivacion)>
        {
            ["GLU"] = (25.00m, 8.00m, 0m),
            ["CREA"] = (30.00m, 10.00m, 0m),
            ["COL"] = (35.00m, 12.00m, 0m),
            ["TRIG"] = (35.00m, 12.00m, 0m),
            ["HB"] = (20.00m, 7.00m, 0m),
            ["HTO"] = (18.00m, 6.00m, 0m),
            ["LEU"] = (28.00m, 9.00m, 0m),
            ["EGO"] = (22.00m, 7.50m, 0m),
            ["TSH"] = (85.00m, 25.00m, 40.00m),
            ["CULT_ORI"] = (60.00m, 20.00m, 30.00m),
        };

        var fechaInicio = new DateOnly(DateTime.UtcNow.Year, 1, 1);

        foreach (var prueba in pruebas)
        {
            var hasPrecio = await context.PruebaPrecios
                .AnyAsync(x => x.PruebaId == prueba.Id);

            if (hasPrecio)
                continue;

            if (!preciosPorCodigo.TryGetValue(prueba.Codigo, out var precio))
                precio = (40.00m, 15.00m, 0m);

            context.PruebaPrecios.Add(new PruebaPrecio
            {
                PruebaId = prueba.Id,
                ImporteFacturado = precio.Facturado,
                CostoLaboratorio = precio.Lab,
                CostoDerivacion = precio.Derivacion,
                FechaInicio = fechaInicio,
                FechaFin = null,
                MotivoCambio = "Tarifa inicial de laboratorio",
            });
        }

        await context.SaveChangesAsync();
    }
}
