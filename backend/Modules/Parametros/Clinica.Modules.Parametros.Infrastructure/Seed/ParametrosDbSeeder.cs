using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Parametros.Infrastructure.Seed;

public static class ParametrosDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("ParametrosDbSeeder");

        var context = services.GetRequiredService<ParametrosDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context);

        logger.LogInformation("Migraciones y datos iniciales de Parametros aplicados correctamente.");
    }

    private static async Task SeedAsync(ParametrosDbContext context)
    {
        await SeedCatalogoGrupoAsync(context, "SEXO", "Sexo", "Catálogo de sexo",
        [
            ("M", "Masculino", "M", 1),
            ("F", "Femenino", "F", 2),
            ("OTRO", "Otro", "OTRO", 3)
        ]);

        await SeedCatalogoGrupoAsync(context, "ESTADO_CIVIL", "Estado civil", "Estado civil de la persona",
        [
            ("SOLTERO", "Soltero/a", "SOLTERO", 1),
            ("CASADO", "Casado/a", "CASADO", 2),
            ("DIVORCIADO", "Divorciado/a", "DIVORCIADO", 3),
            ("VIUDO", "Viudo/a", "VIUDO", 4),
            ("UNION_LIBRE", "Unión libre", "UNION_LIBRE", 5)
        ]);

        await SeedCatalogoGrupoAsync(context, "TIPO_DOCUMENTO", "Tipo de documento", "Tipos de documentos de identificación",
        [
            ("CI", "Cédula de Identidad", "CI", 1),
            ("PASAPORTE", "Pasaporte", "PASAPORTE", 2),
            ("NIT", "NIT", "NIT", 3),
            ("OTRO", "Otro", "OTRO", 4)
        ]);

        await SeedCatalogoGrupoAsync(context, "EXTENSION_DOCUMENTO", "Extensión de documento", "Extensiones departamentales de Bolivia",
        [
            ("LP", "La Paz", "LP", 1),
            ("CB", "Cochabamba", "CB", 2),
            ("SC", "Santa Cruz", "SC", 3),
            ("OR", "Oruro", "OR", 4),
            ("PT", "Potosí", "PT", 5),
            ("TJ", "Tarija", "TJ", 6),
            ("CH", "Chuquisaca", "CH", 7),
            ("BN", "Beni", "BN", 8),
            ("PD", "Pando", "PD", 9)
        ]);

        await SeedCatalogoGrupoAsync(context, "GRUPO_SANGUINEO", "Grupo sanguíneo", "Grupos sanguíneos",
        [
            ("A_POS", "A+", "A+", 1),
            ("A_NEG", "A-", "A-", 2),
            ("B_POS", "B+", "B+", 3),
            ("B_NEG", "B-", "B-", 4),
            ("AB_POS", "AB+", "AB+", 5),
            ("AB_NEG", "AB-", "AB-", 6),
            ("O_POS", "O+", "O+", 7),
            ("O_NEG", "O-", "O-", 8)
        ]);

        await SeedCatalogoGrupoAsync(context, "PARENTESCO", "Parentesco", "Relación con el paciente",
        [
            ("PADRE", "Padre", "PADRE", 1),
            ("MADRE", "Madre", "MADRE", 2),
            ("HIJO", "Hijo/a", "HIJO", 3),
            ("ESPOSO", "Esposo/a", "ESPOSO", 4),
            ("HERMANO", "Hermano/a", "HERMANO", 5),
            ("FAMILIAR", "Familiar", "FAMILIAR", 6),
            ("TUTOR", "Tutor", "TUTOR", 7),
            ("OTRO", "Otro", "OTRO", 8)
        ]);
        
        await SeedCatalogoGrupoAsync(context, "TIPO_DIAGNOSTICO", "Tipo de diagnóstico", "Clasificación del diagnóstico",
        [
            ("PRINCIPAL", "Principal", "PRINCIPAL", 1),
            ("SECUNDARIO", "Secundario", "SECUNDARIO", 2),
            ("INGRESO", "Ingreso", "INGRESO", 3),
            ("EGRESO", "Egreso", "EGRESO", 4),
            ("PRESUNTIVO", "Presuntivo", "PRESUNTIVO", 5),
            ("DEFINITIVO", "Definitivo", "DEFINITIVO", 6)
        ]);

        await SeedCatalogoGrupoAsync(context, "ESTADO_ESTUDIO", "Estado de estudio", "Estados de solicitud de estudios",
        [
            ("SOLICITADO", "Solicitado", "SOLICITADO", 1),
            ("EN_PROCESO", "En proceso", "EN_PROCESO", 2),
            ("RESULTADO", "Con resultado", "RESULTADO", 3),
            ("ANULADO", "Anulado", "ANULADO", 4)
        ]);

        await SeedCatalogoGrupoAsync(context, "VIA_ADMINISTRACION", "Vía de administración", "Vías de administración de medicamentos",
        [
            ("ORAL", "Oral", "ORAL", 1),
            ("SUBLINGUAL", "Sublingual", "SUBLINGUAL", 2),
            ("INTRAMUSCULAR", "Intramuscular", "INTRAMUSCULAR", 3),
            ("INTRAVENOSA", "Intravenosa", "INTRAVENOSA", 4),
            ("SUBCUTANEA", "Subcutánea", "SUBCUTANEA", 5),
            ("TOPICA", "Tópica", "TOPICA", 6),
            ("OFTALMICA", "Oftálmica", "OFTALMICA", 7),
            ("OTICA", "Ótica", "OTICA", 8),
            ("NASAL", "Nasal", "NASAL", 9),
            ("RECTAL", "Rectal", "RECTAL", 10),
            ("INHALATORIA", "Inhalatoria", "INHALATORIA", 11)
        ]);

        await SeedCatalogoGrupoAsync(context, "MODO_INGRESO", "Modo de ingreso", "Modo de ingreso del paciente",
        [
            ("CAMINANDO", "Caminando", "CAMINANDO", 1),
            ("SILLA_RUEDAS", "Silla de ruedas", "SILLA_RUEDAS", 2),
            ("CAMILLA", "Camilla", "CAMILLA", 3),
            ("BRAZOS", "En brazos", "BRAZOS", 4),
            ("AMBULANCIA", "Ambulancia", "AMBULANCIA", 5)
        ]);

        await SeedCatalogoGrupoAsync(context, "ACOMPANADO_DE", "Acompañado de", "Acompañante del paciente",
        [
            ("FAMILIARES", "Familiares", "FAMILIARES", 1),
            ("AMIGOS", "Amigos", "AMIGOS", 2),
            ("SOLO", "Solo", "SOLO", 3),
            ("AMBULANCIA", "Ambulancia", "AMBULANCIA", 4),
            ("OTROS", "Otros", "OTROS", 5)
        ]);

        await SeedCatalogoGrupoAsync(context, "LUGAR_ACCIDENTE", "Lugar del accidente", "Lugar donde ocurrió el accidente",
        [
            ("DOMICILIO", "Domicilio", "DOMICILIO", 1),
            ("VIA_PUBLICA", "Vía pública", "VIA_PUBLICA", 2),
            ("TRABAJO", "Trabajo", "TRABAJO", 3),
            ("OTRO", "Otro", "OTRO", 4)
        ]);

        await SeedCatalogoGrupoAsync(context, "TIPO_ACCIDENTE", "Tipo de accidente", "Tipo de accidente registrado",
        [
            ("PERSONAL", "Personal", "PERSONAL", 1),
            ("LABORAL", "Laboral", "LABORAL", 2),
            ("TRANSITO", "Tránsito", "TRANSITO", 3),
            ("AGRESION_FISICA", "Agresión física", "AGRESION_FISICA", 4),
            ("NO_SE_CONOCE", "No se conoce", "NO_SE_CONOCE", 5)
        ]);

        await SeedCatalogoGrupoAsync(context, "ESTADO_GENERAL", "Estado general", "Estado general del paciente",
        [
            ("BUENO", "Bueno", "BUENO", 1),
            ("REGULAR", "Regular", "REGULAR", 2),
            ("MALO", "Malo", "MALO", 3),
            ("CRITICO", "Crítico", "CRITICO", 4)
        ]);

        await SeedCatalogoGrupoAsync(context, "CONDICION_EGRESO", "Condición de egreso", "Condición del paciente al egresar",
        [
            ("MEJORADO", "Mejorado", "MEJORADO", 1),
            ("NO_MEJORADO", "No mejorado", "NO_MEJORADO", 2),
            ("ESTABLE", "Estable", "ESTABLE", 3),
            ("FALLECIDO", "Fallecido", "FALLECIDO", 4)
        ]);

        await SeedCatalogoGrupoAsync(context, "CAUSA_ALTA", "Causa de alta", "Causa por la cual se da el alta",
        [
            ("MEDICA", "Alta médica", "MEDICA", 1),
            ("VOLUNTARIA", "Alta voluntaria", "VOLUNTARIA", 2),
            ("TRANSFERENCIA", "Transferencia", "TRANSFERENCIA", 3),
            ("FALLECIMIENTO", "Fallecimiento", "FALLECIMIENTO", 4),
            ("FUGA", "Fuga", "FUGA", 5)
        ]);

        await SeedCatalogoGrupoAsync(context, "CONDICION_NACER", "Condición al nacer", "Condición del recién nacido",
        [
            ("VIVO", "Vivo", "VIVO", 1),
            ("MUERTO", "Muerto", "MUERTO", 2)
        ]);

        await SeedCatalogoGrupoAsync(context, "TIPO_NACIMIENTO", "Tipo de nacimiento", "Tipo de nacimiento del recién nacido",
        [
            ("UNICO", "Único", "UNICO", 1),
            ("GEMELAR", "Gemelar", "GEMELAR", 2),
            ("MULTIPLE", "Múltiple", "MULTIPLE", 3)
        ]);
    }

    private static async Task SeedCatalogoGrupoAsync(
        ParametrosDbContext context,
        string codigo,
        string nombre,
        string descripcion,
        (string Codigo, string Nombre, string Valor, int Orden)[] items)
    {
        var grupo = await context.CatalogoGrupos
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Codigo == codigo);

        if (grupo is null)
        {
            grupo = new CatalogoGrupo
            {
                Codigo = codigo,
                Nombre = nombre,
                Descripcion = descripcion,
            };

            context.CatalogoGrupos.Add(grupo);
        }
        else
        {
            grupo.Nombre = nombre;
            grupo.Descripcion = descripcion;
        }

        foreach (var item in items)
        {
            if (grupo.Items.Any(x => x.Codigo == item.Codigo))
                continue;

            grupo.Items.Add(new CatalogoItem
            {
                Codigo = item.Codigo,
                Nombre = item.Nombre,
                Valor = item.Valor,
                Orden = item.Orden,
            });
        }

        await context.SaveChangesAsync();
    }
}