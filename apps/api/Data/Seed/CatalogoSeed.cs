using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class CatalogoSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedCatalogos = BuildSeedCatalogos();

        var codigos = seedCatalogos
            .Select(c => c.Codigo)
            .ToArray();

        var existingGrupos = await dbContext.CatalogosGrupos
            .Include(g => g.Items)
            .Where(g => codigos.Contains(g.Codigo))
            .ToListAsync();

        var existingByCodigo = existingGrupos
            .ToDictionary(g => g.Codigo, StringComparer.OrdinalIgnoreCase);

        foreach (var seed in seedCatalogos)
        {
            if (existingByCodigo.TryGetValue(seed.Codigo, out var existing))
            {
                if (string.IsNullOrWhiteSpace(existing.Descripcion) && !string.IsNullOrWhiteSpace(seed.Descripcion))
                {
                    existing.Descripcion = seed.Descripcion;
                }

                MergeItems(existing, seed.Items);
            }
            else
            {
                var grupo = new CatalogoGrupo
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                foreach (var seedItem in seed.Items)
                {
                    grupo.Items.Add(new CatalogoItem
                    {
                        Valor = seedItem.Valor,
                        Nombre = seedItem.Nombre,
                        Orden = seedItem.Orden,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    });
                }

                dbContext.CatalogosGrupos.Add(grupo);
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static void MergeItems(CatalogoGrupo grupo, List<SeedItem> seedItems)
    {
        var existingValores = grupo.Items
            .Select(i => i.Valor)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var seedItem in seedItems)
        {
            if (existingValores.Contains(seedItem.Valor))
                continue;

            grupo.Items.Add(new CatalogoItem
            {
                CatalogoGrupoId = grupo.Id,
                Valor = seedItem.Valor,
                Nombre = seedItem.Nombre,
                Orden = seedItem.Orden,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            });
        }
    }

    private static List<SeedCatalogo> BuildSeedCatalogos()
    {
        return
        [
            new SeedCatalogo(
                "GENERO",
                "Género",
                "Género de la persona",
                [
                    new SeedItem("M", "Masculino", 1),
                    new SeedItem("F", "Femenino", 2),
                    new SeedItem("O", "Otro", 3)
                ]),

            new SeedCatalogo(
                "TIPO_DOCUMENTO",
                "Tipo de Documento",
                "Tipos de documento de identidad",
                [
                    new SeedItem("CI", "Cédula de Identidad", 1),
                    new SeedItem("PASAPORTE", "Pasaporte", 2),
                    new SeedItem("NIT", "NIT", 3),
                    new SeedItem("EXTRANJERO", "Documento Extranjero", 4)
                ]),

            new SeedCatalogo(
                "EXTENSION_BOLIVIA",
                "Extensiones de Bolivia",
                "Departamentos de Bolivia para documentos de identidad",
                [
                    new SeedItem("BN", "Beni", 1),
                    new SeedItem("CH", "Chuquisaca", 2),
                    new SeedItem("CB", "Cochabamba", 3),
                    new SeedItem("LP", "La Paz", 4),
                    new SeedItem("OR", "Oruro", 5),
                    new SeedItem("PD", "Pando", 6),
                    new SeedItem("PT", "Potosí", 7),
                    new SeedItem("SC", "Santa Cruz", 8),
                    new SeedItem("TJ", "Tarija", 9)
                ]),

            new SeedCatalogo(
                "ESTADO_CIVIL",
                "Estado Civil",
                "Estado civil de la persona",
                [
                    new SeedItem("SOLTERO", "Soltero/a", 1),
                    new SeedItem("CASADO", "Casado/a", 2),
                    new SeedItem("CONVIVIENTE", "Conviviente", 3),
                    new SeedItem("DIVORCIADO", "Divorciado/a", 4),
                    new SeedItem("VIUDO", "Viudo/a", 5)
                ]),

            new SeedCatalogo(
                "GRUPO_SANGUINEO",
                "Grupo Sanguíneo y Factor RH",
                "Clasificación de grupos sanguíneos para pacientes y donantes",
                [
                    new SeedItem("O+", "O Positivo (O+)", 1),
                    new SeedItem("O-", "O Negativo (O-)", 2),
                    new SeedItem("A+", "A Positivo (A+)", 3),
                    new SeedItem("A-", "A Negativo (A-)", 4),
                    new SeedItem("B+", "B Positivo (B+)", 5),
                    new SeedItem("B-", "B Negativo (B-)", 6),
                    new SeedItem("AB+", "AB Positivo (AB+)", 7),
                    new SeedItem("AB-", "AB Negativo (AB-)", 8)
                ]),

            new SeedCatalogo(
                "PARENTESCO",
                "Parentesco Familiar",
                "Grados de parentesco para contactos de emergencia y acompañantes",
                [
                    new SeedItem("PADRE", "Padre", 1),
                    new SeedItem("MADRE", "Madre", 2),
                    new SeedItem("HIJO", "Hijo/a", 3),
                    new SeedItem("CONYUGE", "Cónyuge / Pareja", 4),
                    new SeedItem("HERMANO", "Hermano/a", 5),
                    new SeedItem("ABUELO", "Abuelo/a", 6),
                    new SeedItem("TIO", "Tío/a", 7),
                    new SeedItem("TUTOR", "Tutor Legal / Apoderado", 8),
                    new SeedItem("OTRO", "Otro Conocido", 9)
                ]),

            new SeedCatalogo(
                "TIPO_CONTRATO",
                "Tipo de Contrato Laboral",
                "Modalidades de contratación de personal en Recursos Humanos",
                [
                    new SeedItem("INDEFINIDO", "Contrato a Plazo Indefinido / Planta", 1),
                    new SeedItem("PLAZO_FIJO", "Contrato a Plazo Fijo", 2),
                    new SeedItem("CONSULTORIA", "Consultoría / Servicios Profesionales", 3),
                    new SeedItem("EVENTUAL", "Personal Eventual / Reemplazo", 4),
                    new SeedItem("PASANTIA", "Pasantía / Práctica Formativa", 5)
                ]),

            new SeedCatalogo(
                "VIA_ADMINISTRACION",
                "Vía de Administración de Medicamentos",
                "Rutas terapéuticas para la aplicación y prescripción de fármacos",
                [
                    new SeedItem("ORAL", "Vía Oral", 1),
                    new SeedItem("INTRAVENOSA", "Vía Intravenosa (IV)", 2),
                    new SeedItem("INTRAMUSCULAR", "Vía Intramuscular (IM)", 3),
                    new SeedItem("SUBCUTANEA", "Vía Subcutánea (SC)", 4),
                    new SeedItem("TOPICA", "Vía Tópica / Cutánea", 5),
                    new SeedItem("INHALATORIA", "Vía Inhalatoria", 6),
                    new SeedItem("OFTALMICA", "Vía Oftálmica", 7),
                    new SeedItem("OTICA", "Vía Ótica", 8),
                    new SeedItem("SUBLINGUAL", "Vía Sublingual", 9),
                    new SeedItem("RECTAL", "Vía Rectal", 10)
                ]),

            new SeedCatalogo(
                "FORMA_FARMACEUTICA",
                "Forma Farmacéutica",
                "Presentación física y formulación farmacéutica de productos",
                [
                    new SeedItem("COMPRIMIDO", "Comprimido / Tableta", 1),
                    new SeedItem("CAPSULA", "Cápsula", 2),
                    new SeedItem("JARABE", "Jarabe / Suspensión", 3),
                    new SeedItem("INYECTABLE", "Solución Inyectable / Ampolla", 4),
                    new SeedItem("CREMA", "Crema / Ungüento / Gel", 5),
                    new SeedItem("GOTAS", "Gotas / Solución Oftálmica/Ótica", 6),
                    new SeedItem("AEROSOL", "Aerosol / Spray Inhalador", 7),
                    new SeedItem("SUPOSITORIO", "Supositorio / Óvulo", 8),
                    new SeedItem("POLVO", "Polvo para Reconstituir", 9)
                ]),

            new SeedCatalogo(
                "CONDICION_ALMACENAMIENTO",
                "Condición de Almacenamiento",
                "Requisitos de conservación térmica y ambiental para fármacos y reactivos",
                [
                    new SeedItem("TEMPERATURA_AMBIENTE", "Temperatura Ambiente (15°C - 25°C)", 1),
                    new SeedItem("REFRIGERACION", "Refrigeración / Cadena de Frío (2°C - 8°C)", 2),
                    new SeedItem("CONGELACION", "Congelación (-20°C a -10°C)", 3),
                    new SeedItem("PROTEGIDO_LUZ", "Protegido de la Luz / Fotosensible", 4),
                    new SeedItem("LUGAR_SECO", "Lugar Seco y Ventilado", 5)
                ]),

            new SeedCatalogo(
                "METODO_PAGO",
                "Método de Pago",
                "Formas y modalidades de cobro habilitadas en caja",
                [
                    new SeedItem("EFECTIVO", "Efectivo", 1),
                    new SeedItem("TARJETA_DEBITO", "Tarjeta de Débito", 2),
                    new SeedItem("TARJETA_CREDITO", "Tarjeta de Crédito", 3),
                    new SeedItem("QR", "Pago Móvil QR", 4),
                    new SeedItem("TRANSFERENCIA", "Transferencia Bancaria", 5),
                    new SeedItem("SEGURO", "Cobertura de Seguro Médico", 6)
                ]),

            new SeedCatalogo(
                "TRIAGE_COLOR",
                "Nivel de Triage Hospitalario",
                "Escala de priorización clínica de urgencias (Manchester / RAC)",
                [
                    new SeedItem("ROJO", "Rojo - Reanimación / Emergencia Vital", 1),
                    new SeedItem("NARANJA", "Naranja - Muy Urgente", 2),
                    new SeedItem("AMARILLO", "Amarillo - Urgente", 3),
                    new SeedItem("VERDE", "Verde - Poco Urgente / Normal", 4),
                    new SeedItem("AZUL", "Azul - No Urgente / Consulta Ambulatoria", 5)
                ])
        ];
    }

    private sealed record SeedCatalogo(
        string Codigo,
        string Nombre,
        string Descripcion,
        List<SeedItem> Items);

    private sealed record SeedItem(
        string Valor,
        string Nombre,
        int Orden);
}