using Clinica.Api.Modules.Almacenes.Marca.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class MarcaSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedMarcas = BuildSeedMarcas();

        var codigos = seedMarcas.Select(m => m.Codigo).ToArray();

        var existentes = await dbContext.Marcas
            .Where(m => codigos.Contains(m.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(m => m.Codigo, StringComparer.OrdinalIgnoreCase);

        var faltaGuardar = false;

        foreach (var seed in seedMarcas)
        {
            if (porCodigo.ContainsKey(seed.Codigo))
                continue;

            dbContext.Marcas.Add(new Marca
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
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

    private static List<SeedMarca> BuildSeedMarcas()
    {
        return
        [
            new("ITA", "ITA"),
            new("FOREST", "FOREST"),
            new("NIPRO", "NIPRO"),
            new("BRAUN", "BRAUN"),
            new("LYS", "L y S"),
            new("L_Y_S", "L. Y S"),
            new("TEXAROL", "TEXAROL"),
            new("SOLUCIONES", "SOLUCIONES"),
            new("CHARITO", "CHARITO"),
            new("GMED", "GMED"),
            new("G-MED", "G-MED"),
            new("LABUTECH", "LABUTECH"),
            new("MEDICAL", "MEDICAL"),
            new("OPTIMED", "OPTIMED"),
            new("HPMEDICAL", "HP MEDICAL"),
            new("HIPOALERG", "HIPOALERGENI"),
            new("TAMIVA", "TAMIVA"),
            new("SOLQUIFAR", "SOLQUIFAR"),
            new("VALENCIA", "VALENCIA"),
            new("MEDIPLAST", "MEDIPLAST"),
            new("DKT", "DKT"),
            new("HOSPIMED", "HOSPIMED"),
            new("PREMIER", "PREMIER"),
            new("SAMED", "SAMED"),
            new("RKN", "RKN"),
            new("PROTEC", "PROTEC"),
            new("AMP", "AMP"),
            new("MAXTER", "MAXTER"),
            new("SENCICARE", "SENCICARE"),
            new("DEMETCH", "DEMETCH"),
            new("DEMETECH", "DEMETECH"),
            new("ETHICON", "ETHICON"),
            new("DISMED", "DISMED"),
            new("BIOLINE", "BIOLINE"),
            new("CHANNELMED", "CHANNELMED"),
            new("GEDESA", "GEDESA"),
            new("SANCELA", "SANCELA"),
            new("INSUMED", "INSUMED"),
            new("NEOMEDIC", "NEOMEDIC"),
            new("YKDMED", "YKDMED"),
            new("3M", "3M"),
            new("TENA", "TENA"),
            new("PEQUENIN", "PEQUEÑIN"),
            new("TEICHI", "TEICHI"),
            new("SEGURT", "SEGURT"),
            new("POLYMED", "POLYMED"),
            new("NEOVAC", "NEOVAC"),
            new("ALLEMED", "ALLEMED"),
            new("INTI", "INTI"),
            new("ORQUIDEAS", "ORQUIDEAS"),
            new("CREMER", "CREMER"),
            new("OSTEOSYNT", "OSTEOSYNT."),
            new("BIOLATINA", "BIOLATINA"),
            new("TAGUM", "TAGUM"),
            new("NEOJECT", "NEOJECT"),
            new("VITALSUT", "VITAL SUTURES"),
            new("KOLLSUT", "KOLLSUT"),
            new("PRUDENT", "PRUDENT."),
            new("WELLLEAD", "WELL LEAD"),
            new("SANAFLEX", "SANAFLEX"),
            new("V_SUTURES", "V. SUTURES"),
            new("ABD", "ABD"),
            new("COFAR", "COFAR"),
            new("BRESKOT", "BRESKOT"),
            new("DISMEDIN", "DISMEDIN"),
            new("BAGO", "BAGO"),
            new("VITA", "VITA"),
            new("ALCOS", "ALCOS"),
            new("TERBOL", "TERBOL"),
            new("IFARBO", "IFARBO"),
            new("BRAWN", "BRAWN"),
            new("ECAR", "ECAR"),
            new("LUZA", "LUZA"),
            new("MEGALABS", "MEGALABS"),
            new("IFA", "IFA"),
            new("BIOSANO", "BIOSANO"),
            new("VARDHMAN", "VARDHMAN"),
            new("PHARMANDIN", "PHARMANDINA"),
            new("ALFA", "ALFA"),
            new("UNIVERSAL", "UNIVERSAL. PHAR"),
            new("LAB_ABD", "LAB. ABD"),
            new("LAFEDAR", "LAFEDAR"),
            new("ALMAGRAN", "ALMAGRAN"),
            new("CRISTALIA", "CRISTALIA"),
            new("FARMEDIC", "FARMEDIC"),
            new("HANNEMAN", "HANNEMAN"),
            new("HANEMAN", "HANEMAN"),
            new("M_PHARMA", "M. PHARMA"),
            new("MERCK", "MERCK"),
            new("TECNOFARMA", "TECNOFARMA"),
            new("PHARMAN", "PHARMAN."),
            new("FARMEDICAL", "FARMEDICAL"),
            new("E_ESCOBAR", "ELVIA ESOBAR"),
            new("FATIMA", "FATIMA"),
            new("EUROFARMA", "EUROFARMA"),
            new("MHEDICAL", "MHEDICAL"),
            new("FABRA", "FABRA"),
            new("FARMEDICL", "FARMEDICL"),
            new("VITALIS", "VITALIS"),
            new("KAIS", "KAIS"),
            new("CORVAL", "CORVAL"),
            new("AMFAR", "AMFAR"),
            new("BIOL", "BIOL"),
            new("BIOTENK", "BIOTENK"),
            new("DELTA", "DELTA"),
            new("PFIZER", "PFIZER"),
            new("DXT", "DXT"),
            new("K_PHARMA", "K. PHARMA"),
            new("NORMON", "NORMON"),
            new("QM_PHARMA", "QM PHARMA"),
            new("FARMEDIC_P", "FARMEDIC."),
            new("VALMAX", "VALMAX"),
            new("VININ", "VININ"),
            new("SAVAL", "SAVAL"),
            new("OPES", "OPES"),
            new("EMOSS", "EMOSS"),
            new("FORTIER", "FORTIER"),
            new("PRODEXA", "PRODEXA"),
            new("UNIVERS_PH", "UNIVERS. PH."),
            new("UNIVERSAL_PHARMA", "UNIVERSAL PHARMA"),
            new("NEOCJECT", "NEOCJECT"),
            new("TEXABOL", "TEXABOL"),
            new("CLINICA", "CLINICA"),
            new("LABOTECH", "LABOTECH"),
            new("HIPOALERGENIC", "HIPOALERGENIC"),
            new("FARMAFINA", "FARMAFINA"),
            new("INFARLAB", "INFARLAB"),
            new("TELCHI", "TELCHI"),
            new("PHARMAND_DOT", "PHARMAND."),
            new("IMOSS", "IMOSS"),
            new("FEBSA", "FEBSA"),
            new("VIMIN", "VIMIN"),
            new("PORTUGAL", "PORTUGAL"),
            new("BAYER", "BAYER"),
            new("MEDIHEALTH", "MEDIHEALTH"),
            new("TORRICO_ANTELO", "TORRICO ANTELO"),
            new("CHINOIN", "CHINOIN"),
            new("LAQFAGAL", "LAQFAGAL"),
            new("PROTEX", "PROTEX"),
            new("COFARBOL", "COFARBOL"),
            new("LA_ABEJITA", "LA ABEJITA"),
            new("BRESKOT_PHARMA", "BRESKOT PHARMA"),
            new("ALMARK", "ALMARK"),
            new("MINERVA_SL", "MINERVA S.L"),
            new("DISPROFARMA", "DISPROFARMA"),
            new("GARDEN_HOUSE", "GARDEN HOUSE"),
            new("SANAT", "SANAT"),
            new("KERN_PHARMA", "KERN PHARMA"),
            new("AIDISA", "AIDISA"),
            new("DUTRIEC", "DUTRIEC"),
            new("NORDMARK", "NORDMARK"),
            new("SENSI_CARE", "SENSI CARE"),
            new("DKT_INTERNACIONAL", "DKT INTERNACIONAL")
        ];
    }

    private sealed record SeedMarca(
        string Codigo,
        string Nombre,
        string? Descripcion = null);
}
