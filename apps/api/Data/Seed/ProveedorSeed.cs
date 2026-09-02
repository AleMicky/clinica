using Clinica.Api.Modules.Compras.Proveedor.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class ProveedorSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedProveedores = BuildSeedProveedores();

        var codigos = seedProveedores
            .Select(p => p.Codigo)
            .ToArray();

        var existentes = await dbContext.Proveedores
            .Where(p => codigos.Contains(p.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                p => p.Codigo,
                StringComparer.OrdinalIgnoreCase
            );

        var faltaGuardar = false;

        foreach (var seed in seedProveedores)
        {
            if (porCodigo.TryGetValue(seed.Codigo, out var existente))
            {
                var modificado = false;

                if (existente.RazonSocial != seed.RazonSocial)
                {
                    existente.RazonSocial = seed.RazonSocial;
                    modificado = true;
                }

                if (existente.NombreComercial != seed.NombreComercial)
                {
                    existente.NombreComercial = seed.NombreComercial;
                    modificado = true;
                }

                if (existente.Nit != seed.Nit)
                {
                    existente.Nit = seed.Nit;
                    modificado = true;
                }

                if (existente.Direccion != seed.Direccion)
                {
                    existente.Direccion = seed.Direccion;
                    modificado = true;
                }

                if (existente.Telefono != seed.Telefono)
                {
                    existente.Telefono = seed.Telefono;
                    modificado = true;
                }

                if (existente.Celular != seed.Celular)
                {
                    existente.Celular = seed.Celular;
                    modificado = true;
                }

                if (existente.Email != seed.Email)
                {
                    existente.Email = seed.Email;
                    modificado = true;
                }

                if (existente.Contacto != seed.Contacto)
                {
                    existente.Contacto = seed.Contacto;
                    modificado = true;
                }

                if (existente.Observacion != seed.Observacion)
                {
                    existente.Observacion = seed.Observacion;
                    modificado = true;
                }

                if (modificado)
                {
                    existente.FechaModificacion = DateTime.UtcNow;
                    existente.ModificadoPor = "Seed";
                    faltaGuardar = true;
                }

                continue;
            }

            dbContext.Proveedores.Add(new Proveedor
            {
                Codigo = seed.Codigo,
                RazonSocial = seed.RazonSocial,
                NombreComercial = seed.NombreComercial,
                Nit = seed.Nit,
                Direccion = seed.Direccion,
                Telefono = seed.Telefono,
                Celular = seed.Celular,
                Email = seed.Email,
                Contacto = seed.Contacto,
                Observacion = seed.Observacion,
                Activo = true,
                FechaCreacion = DateTime.UtcNow,
                CreadoPor = "Seed"
            });

            faltaGuardar = true;
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static List<SeedProveedor> BuildSeedProveedores()
    {
        return
        [
            new("TERB", "TERBOL S.A.", "TERBOL", "1028129026", "Barrio Hamacas Calle 2 Este N° 3205", "3426767", "4793642", null, null, null),
            new("ALCO", "LABORATORIOS ALCOS S.A.", "ALCOS", "471825012", null, null, null, null, null, null),
            new("BAGO", "LABORATORIOS BAGO DE BOLIVIA S.A.", "BAGO", null, "Calle Muñoz Cornejo N°. 2808, La Paz", "2797070", null, null, null, null),
            new("COFA", "LABORATORIOS COFAR S.A.", "COFAR", "1020603028", "Capitán Ravelo Nº. 1527, La Paz", null, null, null, null, null),
            new("MEGA", "MEGALABS BOLIVIA S.R.L.", "MEGALABS", "1028301022", "Calle El Rosal Nro. 207, La Paz", null, null, null, null, null),
            new("LABD", "LABORATORIOS ABD LTDA.", "LAB. ABD", "1014883021", null, null, null, null, null, null),
            new("LUZ1", "LUZ", null, null, null, null, null, null, null, null),
            new("AMAJ", "AMAJOVI", null, null, null, null, null, null, null, null),
            new("SOLU", "SOLUCIONES", null, null, null, null, null, null, null, null),
            new("CHAR", "CHARITO", null, null, null, null, null, null, null, null),
            new("VITA", "LABORATORIOS VITA S.A.", "VITA", null, "Av. Hector Ormachea, Nº 320 esq. Calle 1 Obrajes, La Paz", "2788060", null, "laboratorios@vita.com.bo", null, null),
            new("INTI", "DROGUERIA INTI S.A.", "INTI", "1020521023", "Calle Lucas Jaimes Nro. 1959 Zona Miraflores, La Paz", "22176600", null, null, null, null),
            new("DISM", "DISMED", null, null, null, null, null, null, null, null),
            new("INFO", "INFOREST", null, null, null, null, null, null, null, null),
            new("TECN", "TECNOFARMA S.A.", "TECNOFARM", null, "Calle 14 de Septiembre N°. 1146 Zona Obrajes, La Paz", null, null, null, null, null),
            new("LYSI", "LYSI", null, null, null, null, null, null, null, null),
            new("FARB", "FARBOS", null, null, null, null, null, null, null, null),
            new("ANCE", "ANCELATEX", null, null, null, null, null, null, null, null),
            new("ABOL", "ABOL", null, null, null, null, null, null, null, null),
            new("FATI", "FATIMA", null, null, null, null, null, null, null, null),
            new("KAIS", "KAISEL", null, null, null, null, null, null, null, null),
            new("VIA1", "VIA", null, null, null, null, null, null, null, null),
            new("HOSP", "HOSPIMED S.R.L.", "HOSPIMED", "1014239024", null, null, null, null, null, null),
            new("CORM", "CORMESA LTDA.", "CORMESA", "1020631021", null, null, "78500331", null, null, null),
            new("HAHN", "LABORATORIOS HAHNEMANN", "HAHNEMANN", null, null, null, null, null, null, null)
        ];
    }

    private sealed record SeedProveedor(
        string Codigo,
        string RazonSocial,
        string? NombreComercial,
        string? Nit,
        string? Direccion,
        string? Telefono,
        string? Celular,
        string? Email,
        string? Contacto,
        string? Observacion
    );
}
