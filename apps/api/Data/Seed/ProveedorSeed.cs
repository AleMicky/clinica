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
            new("HAHN", "LABORATORIOS HAHNEMANN", "HAHNEMANN", null, null, null, null, null, null, null),
            new("LAB_ABD", "LAB.ABD", "LAB. ABD", null, null, null, null, null, null, null),
            new("ABD_CORTO", "ABD", "ABD", null, null, null, null, null, null, null),
            new("PORTUGAL", "PORTUGAL", "PORTUGAL", null, null, null, null, null, null, null),
            new("BAYER", "BAYER", "BAYER", null, null, null, null, null, null, null),
            new("DISMEDIN", "DISMEDIN", "DISMEDIN", null, null, null, null, null, null, null),
            new("IFARBO", "IFARBO", "IFARBO", null, null, null, null, null, null, null),
            new("ALFA", "ALFA", "ALFA", null, null, null, null, null, null, null),
            new("LAB_ALFA", "LAB.ALFA", "LAB. ALFA", null, null, null, null, null, null, null),
            new("BRAWN", "BRAWN", "BRAWN", null, null, null, null, null, null, null),
            new("TORRICO_ANT", "TORRICO ANTELO", "TORRICO ANTELO", null, null, null, null, null, null, null),
            new("LUZA", "LUZA", "LUZA", null, null, null, null, null, null, null),
            new("MEDIHEALTH", "MEDIHEALTH", "MEDIHEALTH", null, null, null, null, null, null, null),
            new("NEOMEDIC", "NEOMEDIC", "NEOMEDIC", null, null, null, null, null, null, null),
            new("PREMIER", "PREMIER", "PREMIER", null, null, null, null, null, null, null),
            new("NIPRO", "NIPRO", "NIPRO", null, null, null, null, null, null, null),
            new("NEOJECT", "NEOJECT", "NEOJECT", null, null, null, null, null, null, null),
            new("FOREST", "FOREST", "FOREST", null, null, null, null, null, null, null),
            new("IFA", "IFA", "IFA", null, null, null, null, null, null, null),
            new("LAB_IFA", "LAB. IFA", "LAB. IFA", null, null, null, null, null, null, null),
            new("TELCHI", "TELCHI", "TELCHI", null, null, null, null, null, null, null),
            new("TEXABOL", "TEXABOL", "TEXABOL", null, null, null, null, null, null, null),
            new("CHINOIN", "CHINOIN", "CHINOIN", null, null, null, null, null, null, null),
            new("E_ESCOBAR", "ELVIA ESOBAR", "ELVIA ESOBAR", null, null, null, null, null, null, null),
            new("LAQFAGAL", "LAQFAGAL", "LAQFAGAL", null, null, null, null, null, null, null),
            new("SOLQUIFAR", "SOLQUIFAR", "SOLQUIFAR", null, null, null, null, null, null, null),
            new("UNIVERSAL_PH", "UNIVERSAL PHARMA", "UNIVERSAL PHARMA", null, null, null, null, null, null, null),
            new("CLINICA", "CLINICA", "CLINICA", null, null, null, null, null, null, null),
            new("PROTEX", "PROTEX", "PROTEX", null, null, null, null, null, null, null),
            new("GEDESA", "GEDESA", "GEDESA", null, null, null, null, null, null, null),
            new("LABOTECH", "LABOTECH", "LABOTECH", null, null, null, null, null, null, null),
            new("HP_MEDICAL", "HP MEDICAL", "HP MEDICAL", null, null, null, null, null, null, null),
            new("TAMIVA", "TAMIVA", "TAMIVA", null, null, null, null, null, null, null),
            new("COFARBOL", "COFARBOL", "COFARBOL", null, null, null, null, null, null, null),
            new("FARMEDICAL", "FARMEDICAL", "FARMEDICAL", null, null, null, null, null, null, null),
            new("LA_ABEJITA", "LA ABEJITA", "LA ABEJITA", null, null, null, null, null, null, null),
            new("HANNEMAN", "HANNEMAN", "HANNEMAN", null, null, null, null, null, null, null),
            new("HANEMAN", "HANEMAN", "HANEMAN", null, null, null, null, null, null, null),
            new("MHEDICAL_PH", "MHEDICAL PH", "MHEDICAL PH", null, null, null, null, null, null, null),
            new("BRESKOT_PH", "BRESKOT PHARMA", "BRESKOT PHARMA", null, null, null, null, null, null, null),
            new("SAVAL", "SAVAL", "SAVAL", null, null, null, null, null, null, null),
            new("ALMARK", "ALMARK", "ALMARK", null, null, null, null, null, null, null),
            new("VALENCIA", "VALENCIA", "VALENCIA", null, null, null, null, null, null, null),
            new("BRAUN", "BRAUN", "BRAUN", null, null, null, null, null, null, null),
            new("INFARLAB", "INFARLAB", "INFARLAB", null, null, null, null, null, null, null),
            new("TECNOFARMA", "TECNOFARMA", "TECNOFARMA", null, null, null, null, null, null, null),
            new("MINERVA_SL", "MINERVA S.L", "MINERVA S.L", null, null, null, null, null, null, null),
            new("DISPROFARMA", "DISPROFARMA", "DISPROFARMA", null, null, null, null, null, null, null),
            new("FABRA", "FABRA", "FABRA", null, null, null, null, null, null, null),
            new("GARDEN_HOUSE", "GARDEN HOUSE", "GARDEN HOUSE", null, null, null, null, null, null, null),
            new("RKN", "RKN", "RKN", null, null, null, null, null, null, null),
            new("PROTEC", "PROTEC", "PROTEC", null, null, null, null, null, null, null),
            new("TAGUM", "TAGUM", "TAGUM", null, null, null, null, null, null, null),
            new("ALLEMED", "ALLEMED", "ALLEMED", null, null, null, null, null, null, null),
            new("BLAN_NEGRO", "BLAN/NEGRO", "BLAN/NEGRO", null, null, null, null, null, null, null),
            new("NOSOTRAS", "NOSOTRAS", "NOSOTRAS", null, null, null, null, null, null, null),
            new("INSUMED", "INSUMED", "INSUMED", null, null, null, null, null, null, null),
            new("DR_MEDINAT", "DR. MEDINAT", "DR. MEDINAT", null, null, null, null, null, null, null),
            new("FARMAFINA", "FARMAFINA", "FARMAFINA", null, null, null, null, null, null, null),
            new("SANAT", "SANAT", "SANAT", null, null, null, null, null, null, null),
            new("ORQUIDEAS", "ORQUIDEAS", "ORQUIDEAS", null, null, null, null, null, null, null),
            new("PFIZER", "PFIZER", "PFIZER", null, null, null, null, null, null, null),
            new("KERN_PHARMA", "KERN PHARMA", "KERN PHARMA", null, null, null, null, null, null, null),
            new("FEBSA", "FEBSA", "FEBSA", null, null, null, null, null, null, null),
            new("NORMON", "NORMON", "NORMON", null, null, null, null, null, null, null),
            new("SANCELA", "SANCELA", "SANCELA", null, null, null, null, null, null, null),
            new("PEQUENIN", "PEQUEÑIN", "PEQUEÑIN", null, null, null, null, null, null, null),
            new("AIDISA", "AIDISA", "AIDISA", null, null, null, null, null, null, null),
            new("DUTRIEC", "DUTRIEC", "DUTRIEC", null, null, null, null, null, null, null),
            new("CREMER", "CREMER", "CREMER", null, null, null, null, null, null, null),
            new("OSTEOSYNT", "OSTEOSYNT.", "OSTEOSYNT.", null, null, null, null, null, null, null),
            new("BIOLATINA", "BIOLATINA", "BIOLATINA", null, null, null, null, null, null, null),
            new("NORDMARK", "NORDMARK", "NORDMARK", null, null, null, null, null, null, null),
            new("PHARMANDINA", "PHARMANDINA", "PHARMANDINA", null, null, null, null, null, null, null),
            new("SENSI_CARE", "SENSI CARE", "SENSI CARE", null, null, null, null, null, null, null),
            new("L_Y_S", "L Y S", "L. Y S", null, null, null, null, null, null, null),
            new("DKT_INTERNAC", "DKT INTERNACIONAL", "DKT INTERNACIONAL", null, null, null, null, null, null, null),
            new("OPTIMED", "OPTIMED", "OPTIMED", null, null, null, null, null, null, null),
            new("VITAL_SUT", "VITAL SUTURES", "VITAL SUTURES", null, null, null, null, null, null, null),
            new("BIOTENK", "BIOTENK", "BIOTENK", null, null, null, null, null, null, null),
            new("FARMEDIC_P", "FARMEDIC.", "FARMEDIC.", null, null, null, null, null, null, null)
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
