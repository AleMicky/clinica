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
                    existente.ModificadoPor = "Seed";
                    existente.FechaModificacion = DateTime.UtcNow;
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

    private static List<SeedUnidadMedida> BuildSeedUnidades()
    {
        return
        [
            // =========================================================================
            // 1. UNIDADES BÁSICAS, CONTEO Y MAGNITUDES
            // =========================================================================
            new("Unidad / Conteo", "UND", "Unidad", "und"),
            new("Unidad / Conteo", "X_UNIDAD", "X Unidad", "x unidad"),
            new("Unidad / Conteo", "PZA", "Pieza", "pza"),
            new("Unidad / Conteo", "PAR", "Par", "par"),
            new("Unidad / Conteo", "DOC", "Docena", "doc"),
            new("Unidad / Conteo", "CIEN", "Ciento", "cien"),

            // Volumen
            new("Volumen", "ML", "Mililitro", "ml"),
            new("Volumen", "L", "Litro", "l"),
            new("Volumen", "CC", "Centímetro Cúbico", "cc"),
            new("Volumen", "GOT", "Gotas", "gts"),

            // Masa y Peso
            new("Masa / Peso", "MG", "Miligramo", "mg"),
            new("Masa / Peso", "G", "Gramo", "g"),
            new("Masa / Peso", "KG", "Kilogramo", "kg"),
            new("Masa / Peso", "MCG", "Microgramo", "mcg"),

            // Longitud
            new("Longitud", "CM", "Centímetro", "cm"),
            new("Longitud", "M", "Metro", "m"),
            new("Longitud", "MM", "Milímetro", "mm"),
            new("Longitud", "PULG", "Pulgada", "in"),

            // Dosificación y Clínico
            new("Dosificación", "UI", "Unidades Internacionales", "UI"),
            new("Dosificación", "DOSIS", "Dosis / Aplicación", "dosis"),

            // Servicios y Tiempo
            new("Servicios / Tiempo", "HR", "Hora", "hr"),
            new("Servicios / Tiempo", "SES", "Sesión", "sesión"),
            new("Servicios / Tiempo", "SRV", "Servicio / Procedimiento", "srv"),

            // =========================================================================
            // 2. FORMAS FARMACÉUTICAS SÓLIDAS Y ORALES
            // =========================================================================
            new("Forma Farmacéutica Sólida", "COMPRIMIDO", "Comprimido", "comp"),
            new("Forma Farmacéutica Sólida", "COMPRIMIDOS", "Comprimidos", "comps"),
            new("Forma Farmacéutica Sólida", "COMP_RECUBIERTO", "Comprimido Recubierto", "comp rec"),
            new("Forma Farmacéutica Sólida", "COMPRIMIDOS_RECUBIERTOS", "Comprimidos Recubiertos", "comps rec"),
            new("Forma Farmacéutica Sólida", "COMP_MASTICABLE", "Comprimido Masticable", "comp mast"),
            new("Forma Farmacéutica Sólida", "COMP_EFERVESCENTE", "Comprimido Efervescente", "comp eferv"),
            new("Forma Farmacéutica Sólida", "COMP_EFERVECESTE", "Comprimido Eferveceste", "comp efer"),
            new("Forma Farmacéutica Sólida", "COMPRIMIDOS_EFERVERCESNTE", "Comprimidos Efervercesnte", "comps efer"),
            new("Forma Farmacéutica Sólida", "COMP_SUBLINGUAL", "Comp.Sublingual", "comp sub"),
            new("Forma Farmacéutica Sólida", "TABLETA", "Tableta", "tab"),
            new("Forma Farmacéutica Sólida", "TABLETAS", "Tabletas", "tabs"),
            new("Forma Farmacéutica Sólida", "TABLETAS_RECUBIERTAS", "Tabletas Recubiertas", "tabs rec"),
            new("Forma Farmacéutica Sólida", "TABLETAS_SUBLINGUALES", "Tabletas Sublinguales", "tabs sub"),
            new("Forma Farmacéutica Sólida", "CAPSULA", "Capsula", "cap"),
            new("Forma Farmacéutica Sólida", "CAPSULAS", "Capsulas", "caps"),
            new("Forma Farmacéutica Sólida", "CAPSUAS", "Capsuas", "capsuas"),
            new("Forma Farmacéutica Sólida", "PASTILLAS", "Pastillas", "past"),
            new("Forma Farmacéutica Sólida", "CARAMELO", "Caramelo", "caram"),
            new("Forma Farmacéutica Sólida", "GRAGEAS", "Grageas", "grag"),
            new("Forma Farmacéutica Sólida", "GOMAS_MASTICABLES", "Gomas Masticables", "gomas"),
            new("Forma Farmacéutica Sólida", "POLVO", "Polvo", "polvo"),
            new("Forma Farmacéutica Sólida", "GRANULADO", "Granulado", "gran"),
            new("Forma Farmacéutica Sólida", "POLVO_GRANULADO", "Polvo Granulado", "polvo gran"),
            new("Forma Farmacéutica Sólida", "POLVO_EFERVESCENTE", "Polvo Efervescente", "polvo eferv"),
            new("Forma Farmacéutica Sólida", "POLVO_EFERVECENTE", "Polvo Efervecente", "polvo efer"),
            new("Forma Farmacéutica Sólida", "POLVO_INYECT", "Polvo Inyect.", "polvo iny"),
            new("Forma Farmacéutica Sólida", "SAL_CRISTALIZADA", "Sal Cristalizada", "sal crist"),
            new("Forma Farmacéutica Sólida", "SOLIDA", "Solida", "solida"),

            // =========================================================================
            // 3. FORMAS FARMACÉUTICAS LÍQUIDAS E INYECTABLES
            // =========================================================================
            new("Forma Farmacéutica Líquida", "AMPOLLA", "Ampolla", "amp"),
            new("Forma Farmacéutica Líquida", "AMPOLLAS", "Ampollas", "amps"),
            new("Forma Farmacéutica Líquida", "AMP_20ML", "20ml Ampolla", "20ml amp"),
            new("Forma Farmacéutica Líquida", "INYECTABLE_1ML", "Inyectable X 1ml", "iny 1ml"),
            new("Forma Farmacéutica Líquida", "VIAL", "Vial", "vial"),
            new("Forma Farmacéutica Líquida", "VIALES", "Viales", "viales"),
            new("Forma Farmacéutica Líquida", "VIAL_INYECT", "Vial Inyect.", "vial iny"),
            new("Forma Farmacéutica Líquida", "JARABE", "Jarabe", "jbe"),
            new("Forma Farmacéutica Líquida", "SUSPENSION", "Suspension", "susp"),
            new("Forma Farmacéutica Líquida", "SUSPENSION_TILD", "Suspensión", "suspensión"),
            new("Forma Farmacéutica Líquida", "SUSPENCON", "Suspencon", "suspencon"),
            new("Forma Farmacéutica Líquida", "SOLUCION", "Solucion", "sol"),
            new("Forma Farmacéutica Líquida", "SOLUCION_TILD", "Solución", "solución"),
            new("Forma Farmacéutica Líquida", "SOLUCION_ORAL", "Solucion Oral", "sol oral"),
            new("Forma Farmacéutica Líquida", "SOLUCIO_TOPICA", "Solucio Topica", "sol top"),
            new("Forma Farmacéutica Líquida", "SOLUCION_TOPICA", "Solucion Topica", "sol topica"),
            new("Forma Farmacéutica Líquida", "SOLUCION_OTICA", "Solucion Otica", "sol otica"),
            new("Forma Farmacéutica Líquida", "SOL_OFTALMICA", "Sol.Oftalmica", "sol oft"),
            new("Forma Farmacéutica Líquida", "SOLUCION_OFTALMICA", "Solucion Oftalmica", "sol oftalm"),
            new("Forma Farmacéutica Líquida", "SOLUCION_NASAL", "Solucion Nasal", "sol nasal"),
            new("Forma Farmacéutica Líquida", "ANTIBIOTICO_OFTALMICO", "Antibiotico Oftalmico", "ab oft"),
            new("Forma Farmacéutica Líquida", "GOTAS_ORALES", "Gotas Orales", "gts oral"),
            new("Forma Farmacéutica Líquida", "GOTAS_NASALES", "Gotas Nasales", "gts nas"),
            new("Forma Farmacéutica Líquida", "SOLUCION_GOTAS", "Solucion Gotas", "sol gts"),
            new("Forma Farmacéutica Líquida", "LOCION", "Locion", "loc"),
            new("Forma Farmacéutica Líquida", "LOCION_TILD", "Loción", "loción"),
            new("Forma Farmacéutica Líquida", "EMULSION", "Emulsion", "emuls"),
            new("Forma Farmacéutica Líquida", "EMULSION_TILD", "Emulsión", "emulsión"),
            new("Forma Farmacéutica Líquida", "EMULCION", "Emulcion", "emulcion"),
            new("Forma Farmacéutica Líquida", "SPRAY", "Spray", "spray"),
            new("Forma Farmacéutica Líquida", "SPRAY_50ML", "Spray X 50ml", "spray 50ml"),
            new("Forma Farmacéutica Líquida", "TONICO", "Tonico", "tonico"),
            new("Forma Farmacéutica Líquida", "LIQUIDO", "Liquido", "liq"),
            new("Forma Farmacéutica Líquida", "INFUSION", "Infusion", "infus"),
            new("Forma Farmacéutica Líquida", "PEDICULICIDA", "Pediculicida", "pedic"),
            new("Forma Farmacéutica Líquida", "ANTISEPTICO_JABONOSO", "Antiseptico Jabonoso", "antisept"),
            new("Forma Farmacéutica Líquida", "CLOREXIDINA", "Clorexidina", "clorex"),
            new("Forma Farmacéutica Líquida", "JABON_INTIMO", "Jabon Intimo", "jab int"),
            new("Forma Farmacéutica Líquida", "SUERO", "Suero", "suero"),

            // =========================================================================
            // 4. FORMAS FARMACÉUTICAS SEMISÓLIDAS Y TÓPICAS
            // =========================================================================
            new("Forma Farmacéutica Semisólida", "CREMA", "Crema", "crm"),
            new("Forma Farmacéutica Semisólida", "CREMA_DERMICA", "Crema Dermica", "crm derm"),
            new("Forma Farmacéutica Semisólida", "CREMA_TOPICA", "Crema Topica", "crm top"),
            new("Forma Farmacéutica Semisólida", "CREMA_FACIAL", "Crema Facial", "crm fac"),
            new("Forma Farmacéutica Semisólida", "POMADA", "Pomada", "pom"),
            new("Forma Farmacéutica Semisólida", "UNGÜENTO", "Ungüento", "ung"),
            new("Forma Farmacéutica Semisólida", "GEL", "Gel", "gel"),
            new("Forma Farmacéutica Semisólida", "GEL_FACIEL", "Gel Faciel", "gel fac"),
            new("Forma Farmacéutica Semisólida", "GEL_FACIAL", "Gel Facial", "gel facial"),
            new("Forma Farmacéutica Semisólida", "GEL_BUCAL", "Gel Bucal", "gel buc"),
            new("Forma Farmacéutica Semisólida", "GEL_TOPICO", "Gel Topico", "gel top"),
            new("Forma Farmacéutica Semisólida", "JALEA", "Jalea", "jalea"),

            // =========================================================================
            // 5. VÍAS ESPECIALES Y OTROS MEDICAMENTOS
            // =========================================================================
            new("Vías Especiales", "SUPOSITORIO", "Supositorio", "sup"),
            new("Vías Especiales", "OVULOS", "Ovulos", "ov"),
            new("Vías Especiales", "OVULO", "Ovulo", "ovulo"),
            new("Vías Especiales", "PARCHES", "Parches", "parche"),
            new("Vías Especiales", "JERINGA_PRELLENADA", "Jeringa Prellenada", "jer prel"),
            new("Vías Especiales", "PRELLENADA", "Prellenada", "prel"),

            // =========================================================================
            // 6. ENVASES, EMPAQUES Y PRESENTACIONES GENÉRICAS
            // =========================================================================
            new("Presentación / Empaque", "CAJA", "Caja", "caja"),
            new("Presentación / Empaque", "CAJAS", "Cajas", "cajas"),
            new("Presentación / Empaque", "FRASCO", "Frasco", "fco"),
            new("Presentación / Empaque", "FRASCOS", "Frascos", "fcos"),
            new("Presentación / Empaque", "FRASCO_ESTERIL", "Frasco Esteril", "fco est"),
            new("Presentación / Empaque", "X_FRASCO", "X Frasco", "x fco"),
            new("Presentación / Empaque", "BIDON", "Bidon", "bidon"),
            new("Presentación / Empaque", "BLISTER", "Blíster", "blíster"),
            new("Presentación / Empaque", "BLI", "Blister", "bli"),
            new("Presentación / Empaque", "TUBO", "Tubo", "tubo"),
            new("Presentación / Empaque", "X_TUBO", "X Tubo", "x tubo"),
            new("Presentación / Empaque", "TUBO_EFERVESCENTE", "Tubo Efervescente", "tubo eferv"),
            new("Presentación / Empaque", "SOBRE", "Sobre", "sob"),
            new("Presentación / Empaque", "SOBRES", "Sobres", "sobres"),
            new("Presentación / Empaque", "SACHET", "Sachet", "sachet"),
            new("Presentación / Empaque", "BOLSA", "Bolsa", "bolsa"),
            new("Presentación / Empaque", "BOLSA_80", "Bolsa X 80", "bolsa 80"),
            new("Presentación / Empaque", "KIT", "Kit", "kit"),
            new("Presentación / Empaque", "ROLLO", "Rollo", "rollo"),
            new("Presentación / Empaque", "PAQUETE", "Paquete", "paq"),
            new("Presentación / Empaque", "PAQ", "Paq", "pq"),

            // =========================================================================
            // 7. INSUMOS Y MATERIAL QUIRÚRGICO / HOSPITALARIO
            // =========================================================================
            new("Insumo / Dispositivo", "INSUMO", "Insumo", "insumo"),
            new("Insumo / Dispositivo", "BATA", "Bata", "bata"),
            new("Insumo / Dispositivo", "GORRO", "Gorro", "gorro"),
            new("Insumo / Dispositivo", "TRIPLE_CAPA", "Triple Capa", "3 capa"),
            new("Insumo / Dispositivo", "CUBRE_CALZADO", "Cubre Calzado", "cubre calz"),
            new("Insumo / Dispositivo", "BAJA_DE_LENGUAS", "Baja De Lenguas", "baj lengua"),
            new("Insumo / Dispositivo", "CATETER_IV", "Cateter IV", "cateter"),
            new("Insumo / Dispositivo", "CANULA", "Canula", "canula"),
            new("Insumo / Dispositivo", "JERINGA", "Jeringa", "jeringa"),
            new("Insumo / Dispositivo", "AGUJA_22G_2", "Aguja 22G X 2\"", "aguja 2\""),
            new("Insumo / Dispositivo", "AGUJA_22G_3", "Aguja 22G X 3 1/8", "aguja 3 1/8"),
            new("Insumo / Dispositivo", "SUTURA", "Sutura", "sutura"),
            new("Insumo / Dispositivo", "HILO", "Hilo", "hilo"),
            new("Insumo / Dispositivo", "CALIBRE_3_0", "3-0", "3-0"),
            new("Insumo / Dispositivo", "HOJA_BISTURI", "Hoja De Bisturi", "bisturi"),
            new("Insumo / Dispositivo", "SONDA", "Sonda", "sonda"),
            new("Insumo / Dispositivo", "SONDA_NASOGASTRICA", "Sonda Nasogastrica", "sonda ng"),
            new("Insumo / Dispositivo", "BURETA", "Bureta", "bureta"),
            new("Insumo / Dispositivo", "EQUIPO_SUERO", "Equipo De Suero", "eq suero"),
            new("Insumo / Dispositivo", "COLECTOR", "Colector", "colector"),
            new("Insumo / Dispositivo", "CHATA", "Chata", "chata"),
            new("Insumo / Dispositivo", "PATO", "Pato", "pato"),
            new("Insumo / Dispositivo", "CURATIVOS", "Curativos", "curativo"),
            new("Insumo / Dispositivo", "ALGODON", "Algodón", "algodón"),
            new("Insumo / Dispositivo", "CINTA_ADH", "Cinta Adh.", "cinta"),
            new("Insumo / Dispositivo", "X_9_METROS", "X 9 Metros", "9m"),
            new("Insumo / Dispositivo", "VENDA", "Venda", "venda"),
            new("Insumo / Dispositivo", "VENDA_GASA", "Venda De Gasa", "vda gasa"),
            new("Insumo / Dispositivo", "VENDA_YESO", "Venda De Yeso", "vda yeso"),
            new("Insumo / Dispositivo", "VENDA_ELASTICA", "Venda Elastica", "vda elast"),
            new("Insumo / Dispositivo", "ROLLO_9M", "X Rollo 9M.", "rollo 9m"),
            new("Insumo / Dispositivo", "DIM_5CM_4_5M", "5Cm/4,5M", "5cm x 4.5m"),
            new("Insumo / Dispositivo", "TAMPON", "Tampon", "tampon"),
            new("Insumo / Dispositivo", "TOHALLA_HIGIENICA", "Tohalla Higienica", "toalla hig"),
            new("Insumo / Dispositivo", "PROTECTOR_DIARIO", "Protector Diario", "prot diario"),
            new("Insumo / Dispositivo", "PANITOS_HUMEDOS", "Pañitos Humedos", "pañitos"),
            new("Insumo / Dispositivo", "CONTROL", "Control", "control"),
            new("Insumo / Dispositivo", "ADULTO", "Adulto", "adulto"),
            new("Insumo / Dispositivo", "PEDIATRICO", "Pediatrico", "pediatrico"),

            // =========================================================================
            // 8. PRESENTACIONES ESPECÍFICAS DE VOLUMEN / PESO (CON ENVASE)
            // =========================================================================
            new("Presentación Específica", "FRASCO_15ML", "Frasco 15Ml", "fco 15ml"),
            new("Presentación Específica", "FRASCO_20ML", "Frasco 20Ml", "fco 20ml"),
            new("Presentación Específica", "X_FRASCO_20ML", "X Frasco 20Ml", "x fco 20ml"),
            new("Presentación Específica", "FRASCO_X_30ML", "Frasco X 30Ml", "fco 30ml"),
            new("Presentación Específica", "FRASCO_X_40ML", "Frasco X 40Ml", "fco 40ml"),
            new("Presentación Específica", "FRASCO_X_50ML", "Frasco X 50Ml", "fco 50ml"),
            new("Presentación Específica", "X_FRASCO_50ML", "X Frasco 50Ml", "x fco 50ml"),
            new("Presentación Específica", "X_FRASCO_60ML", "X Frasco 60Ml", "x fco 60ml"),
            new("Presentación Específica", "FRASCO_X_60ML", "Frasco X 60Ml", "fco x 60ml"),
            new("Presentación Específica", "X_FRASCO_80ML", "X Frasco 80Ml", "x fco 80ml"),
            new("Presentación Específica", "FRASCO_X_90ML", "Frasco X 90Ml", "fco 90ml"),
            new("Presentación Específica", "X_FRASCO_90ML", "X Frasco 90Ml", "x fco 90ml"),
            new("Presentación Específica", "FRASCO_100ML", "Frasco 100Ml", "fco 100ml"),
            new("Presentación Específica", "FRASCO_X_100ML", "Frasco X 100Ml", "fco x 100ml"),
            new("Presentación Específica", "X_FRASCO_100ML", "X Frasco 100Ml", "x fco 100ml"),
            new("Presentación Específica", "VOL_100ML", "X 100Ml", "100ml"),
            new("Presentación Específica", "FRASCO_200ML", "Frasco 200Ml", "fco 200ml"),
            new("Presentación Específica", "X_FRASCO_200ML", "X Frasco 200Ml", "x fco 200ml"),
            new("Presentación Específica", "VOL_200ML", "200ml", "200ml"),
            new("Presentación Específica", "FRASCO_250ML", "Frasco 250Ml", "fco 250ml"),
            new("Presentación Específica", "X_FRASCO_250ML", "X Frasco 250Ml", "x fco 250ml"),
            new("Presentación Específica", "FRASCO_500ML", "Frasco 500Ml", "fco 500ml"),
            new("Presentación Específica", "VOL_500ML", "X 500Ml", "500ml"),
            new("Presentación Específica", "FRASCO_3_5GR", "Frasco 3,5Gr", "fco 3.5g"),
            new("Presentación Específica", "FRASCO_500GR", "Frasco 500Gr", "fco 500g"),
            new("Presentación Específica", "FRASCO_X_500GR", "Frasco X 500Gr", "fco x 500g"),
            new("Presentación Específica", "VOL_1_LITRO", "X 1 Litro", "1L"),
            new("Presentación Específica", "VOL_5_LITROS", "X 5 Kitros", "5L"),
            new("Presentación Específica", "X_TUBO_10GR", "X Tubo 10Gr", "tubo 10g"),
            new("Presentación Específica", "TUBO_15GR", "Tubo 15Gr", "tubo 15g"),
            new("Presentación Específica", "TUBO_30GR", "Tubo 30Gr", "tubo 30g"),
            new("Presentación Específica", "TUBO_X_30GR", "Tubo X 30Gr", "tubo x 30g"),
            new("Presentación Específica", "X_TUBO_30GR", "X Tubo 30Gr", "x tubo 30g"),
            new("Presentación Específica", "TUBO_X_50GR", "Tubo X 50 Gr", "tubo 50g"),
            new("Presentación Específica", "TUBO_X_60GR", "Tubo X 60Gr", "tubo 60g"),
            new("Presentación Específica", "X_TUBO_60GR", "X Tubo 60Gr", "x tubo 60g"),

            // =========================================================================
            // 9. PACKS / AGRUPACIONES MULTI-UNIDAD
            // =========================================================================
            // Ampollas / Viales
            new("Packs / Multi-unidad", "X_1_AMPOLLA", "X 1 Ampolla", "1 amp"),
            new("Packs / Multi-unidad", "X_5_AMPOLLAS", "X 5 Ampollas", "5 amp"),
            new("Packs / Multi-unidad", "X_10_AMPOLLAS", "X 10 Ampollas", "10 amp"),
            new("Packs / Multi-unidad", "X_16_AMPOLLAS", "X 16 Ampollas", "16 amp"),
            new("Packs / Multi-unidad", "X_25_AMP", "X 25 Amp.", "25 amp"),
            new("Packs / Multi-unidad", "X_25_AMPOLLAS", "X 25 Ampollas", "25 amps"),
            new("Packs / Multi-unidad", "X_50_AMPOLLAS", "X 50 Ampollas", "50 amp"),
            new("Packs / Multi-unidad", "X_100_AMPOLLAS", "X 100 Ampollas", "100 amp"),
            new("Packs / Multi-unidad", "X_1_VIAL", "X 1 Vial", "1 vial"),
            new("Packs / Multi-unidad", "X_5_VIAL", "X 5 Vial", "5 vial"),
            new("Packs / Multi-unidad", "X_5_VIALES", "X 5 Viales", "5 viales"),
            new("Packs / Multi-unidad", "X_10_VIALES", "X 10 Viales", "10 viales"),
            new("Packs / Multi-unidad", "X_25_VIALES", "X 25 Viales", "25 viales"),

            // Frascos
            new("Packs / Multi-unidad", "X_1_FRASCO", "X 1 Frasco", "1 fco"),
            new("Packs / Multi-unidad", "X_3_FRASCOS", "X 3 Fracos", "3 fcos"),
            new("Packs / Multi-unidad", "X_5_FRASCOS", "X 5 Frascos", "5 fcos"),
            new("Packs / Multi-unidad", "X_10_FRASCOS", "X 10 Frascos", "10 fcos"),
            new("Packs / Multi-unidad", "X_12_FRASCOS", "X 12 Frascos", "12 fcos"),
            new("Packs / Multi-unidad", "X_20_FRASCOS", "X 20 Frascos", "20 fcos"),

            // Packs con Óvulos
            new("Packs / Multi-unidad", "X_1_OVULO", "X 1 Ovulo", "1 ov"),
            new("Packs / Multi-unidad", "X_10_OVULOS", "X 10 Ovulos", "10 ov"),
            new("Packs / Multi-unidad", "X_10_0VULOS", "X 10 0Vulos", "10 ovulos"),
            new("Packs / Multi-unidad", "X_12_OVULOS", "X 12 Ovulos", "12 ov"),
            new("Packs / Multi-unidad", "X_12_OVULOS_MIN", "x 12 OVULOS", "x 12 ov"),

            // Comprimidos / Tabletas / Grageas
            new("Packs / Multi-unidad", "X_4_COMPRIM", "X 4 Comprim.", "4 comp"),
            new("Packs / Multi-unidad", "X_10_COMPRIM", "X 10 Comprim.", "10 comp"),
            new("Packs / Multi-unidad", "X_14_COMPRIMIDOS", "X 14 Comprimidos", "14 comp"),
            new("Packs / Multi-unidad", "X_15_COMPRIM", "X 15 Comprim.", "15 comp"),
            new("Packs / Multi-unidad", "X_20_COMPRIM", "X 20 Comprim.", "20 comp"),
            new("Packs / Multi-unidad", "X_30_COMPRIM", "X 30 Comprim.", "30 comp"),
            new("Packs / Multi-unidad", "X_100_COMPRIM", "X 100 Comprim.", "100 comp"),
            new("Packs / Multi-unidad", "X_320_COMPRIM", "X 320 Comprim.", "320 comp"),
            new("Packs / Multi-unidad", "X_10_TABLETAS", "X 10 Tabletas", "10 tab"),
            new("Packs / Multi-unidad", "X_21_TABLETAS", "X 21Tabletas", "21 tab"),
            new("Packs / Multi-unidad", "X_30_TABLETAS", "X 30 Tabletas", "30 tab"),
            new("Packs / Multi-unidad", "X_50_TABLETAS", "X 50 Tabletas", "50 tab"),
            new("Packs / Multi-unidad", "X_100_TABLETAS", "X 100 Tabletas", "100 tab"),
            new("Packs / Multi-unidad", "X100_TABLETAS", "X100 Tabletas", "x100 tab"),
            new("Packs / Multi-unidad", "X_200_TABLETAS", "X 200 Tabletas", "200 tab"),
            new("Packs / Multi-unidad", "X_21_GRAGEAS", "X 21 Grageas", "21 grag"),

            // Cápsulas
            new("Packs / Multi-unidad", "X_2_CAPSULAS", "X 2 Capsulas", "2 cap"),
            new("Packs / Multi-unidad", "X_12_CAPSULAS", "X 12 Capsulas", "12 cap"),
            new("Packs / Multi-unidad", "X_24_CAPSULAS", "X 24 Capsulas", "24 cap"),
            new("Packs / Multi-unidad", "X_30_CAPSULAS", "X 30 Capsulas", "30 cap"),
            new("Packs / Multi-unidad", "X_35_CAPSULAS", "X 35 Capsulas", "35 cap"),
            new("Packs / Multi-unidad", "X35_CAPSULAS", "X35 Capsulas", "x35 cap"),
            new("Packs / Multi-unidad", "X_50_CAPSULAS", "X 50 Capsulas", "50 cap"),
            new("Packs / Multi-unidad", "X_100_CAPS", "X 100 Caps", "100 cap"),
            new("Packs / Multi-unidad", "X_120_CAPSULAS", "X 120 Capsulas", "120 cap"),
            new("Packs / Multi-unidad", "X_200_CAPSULAS", "X200 Capsulas", "200 cap"),

            // Sobres / Sachets
            new("Packs / Multi-unidad", "X_10_SOBRES", "X 10 Sobres", "10 sob"),
            new("Packs / Multi-unidad", "X_24_SOBRES", "X 24 Sobres", "24 sob"),
            new("Packs / Multi-unidad", "X_25_SACHETS", "X 25 Sachets", "25 sach"),
            new("Packs / Multi-unidad", "X_30_SOBRES", "X 30 Sobres", "30 sob"),
            new("Packs / Multi-unidad", "X_40_SOBRES", "X 40 Sobres", "40 sob"),
            new("Packs / Multi-unidad", "X_60_SOBRES", "X 60 Sobres", "60 sob"),

            // Otras cantidades e Insumos
            new("Packs / Multi-unidad", "X_1_TUBO", "X 1 Tubo", "1 tubo"),
            new("Packs / Multi-unidad", "X_1_UNIDAD", "X 1 Unidad", "1 und"),
            new("Packs / Multi-unidad", "X_6_UNIDADES", "X 6 Unidades", "6 und"),
            new("Packs / Multi-unidad", "X_12_UNIDADES", "X 12", "12 und"),
            new("Packs / Multi-unidad", "X_20_UNIDADES", "X 20 Unidades", "20 und"),
            new("Packs / Multi-unidad", "X_25_JERINGAS", "X 25 Jeringas", "25 jer"),
            new("Packs / Multi-unidad", "X_50_UNIDADES", "X 50 Unidades", "50 und"),
            new("Packs / Multi-unidad", "X_100_UNIDADES", "X 100", "100"),
            new("Packs / Multi-unidad", "X_100_UNIDADES_TXT", "X 100 Unidades", "100 und"),
            new("Packs / Multi-unidad", "X_500_UNIDADES", "X 500", "500")
        ];
    }

    private sealed record SeedUnidadMedida(
        string Categoria,
        string Codigo,
        string Nombre,
        string Simbolo
    );
}
