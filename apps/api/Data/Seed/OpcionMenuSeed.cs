using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class OpcionMenuSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var seedOpciones = BuildSeedOpciones();

        var existentes = await dbContext.OpcionesMenu
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                x => x.Codigo,
                StringComparer.OrdinalIgnoreCase);

        var pendientes = seedOpciones.ToList();

        var huboCambios = false;

        while (pendientes.Count > 0)
        {
            var insertadosEnIteracion = 0;

            foreach (var seed in pendientes.ToList())
            {
                if (porCodigo.ContainsKey(seed.Codigo))
                {
                    pendientes.Remove(seed);
                    continue;
                }

                int? padreId = null;

                if (!string.IsNullOrWhiteSpace(seed.CodigoPadre))
                {
                    if (!porCodigo.TryGetValue(
                            seed.CodigoPadre,
                            out var padre))
                    {
                        continue;
                    }

                    padreId = padre.Id;
                }

                var entity = new OpcionMenu
                {
                    PadreId = padreId,
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Ruta = seed.Ruta,
                    Icono = seed.Icono,
                    Orden = seed.Orden,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                dbContext.OpcionesMenu.Add(entity);

                await dbContext.SaveChangesAsync();

                porCodigo[entity.Codigo] = entity;

                pendientes.Remove(seed);

                insertadosEnIteracion++;

                huboCambios = true;
            }

            if (insertadosEnIteracion == 0)
            {
                var faltantes = string.Join(
                    ", ",
                    pendientes.Select(x => x.Codigo));

                throw new InvalidOperationException(
                    $"No se pudieron insertar las opciones de menú: {faltantes}. Verifique los códigos padre.");
            }
        }

        if (!huboCambios)
            return;
    }

    private static List<SeedOpcionMenu> BuildSeedOpciones()
    {
        return
        [
            // =========================================================
            // PRINCIPAL
            // =========================================================

            new(
                "PRINCIPAL",
                "Principal",
                null,
                null,
                1,
                null),

            new(
                "INICIO",
                "Inicio",
                "/dashboard",
                "Home",
                1,
                "PRINCIPAL"),

            new(
                "ADMISIONES",
                "Admisiones",
                "/recepcion/admisiones",
                "FileText",
                2,
                "PRINCIPAL"),


            // =========================================================
            // CLÍNICA & SERVICIOS
            // =========================================================

            new(
                "CLINICA_SERVICIOS",
                "Clínica & Servicios",
                null,
                null,
                2,
                null),

            new(
                "RECEPCION",
                "Recepción",
                null,
                "HeartPulse",
                1,
                "CLINICA_SERVICIOS"),

            new(
                "PACIENTES",
                "Pacientes",
                "/recepcion/pacientes",
                "User",
                1,
                "RECEPCION"),

            new(
                "SERVICIOS",
                "Servicios",
                null,
                "Stethoscope",
                2,
                "CLINICA_SERVICIOS"),

            new(
                "CATEGORIAS_SERVICIOS",
                "Categorías y Servicios",
                "/servicios/categorias",
                "Layers",
                1,
                "SERVICIOS"),

            new(
                "TARIFARIOS",
                "Tarifarios",
                "/servicios/tarifarios",
                "Tag",
                2,
                "SERVICIOS"),

            new(
                "CONVENIOS",
                "Convenios",
                "/servicios/convenios",
                "Handshake",
                3,
                "SERVICIOS"),


            // =========================================================
            // CAJA & VENTAS
            // =========================================================

            new(
                "CAJA_VENTAS",
                "Caja & Ventas",
                null,
                null,
                3,
                null),

            new(
                "VENTAS",
                "Ventas",
                "/ventas",
                "Coins",
                1,
                "CAJA_VENTAS"),

            new(
                "COBROS",
                "Cobros",
                "/cobros",
                "CreditCard",
                2,
                "CAJA_VENTAS"),

            new(
                "CAJAS",
                "Cajas",
                null,
                "Vault",
                3,
                "CAJA_VENTAS"),

            new(
                "PUNTOS_CAJA",
                "Puntos de Caja",
                "/cajas",
                "Vault",
                1,
                "CAJAS"),

            new(
                "MOVIMIENTOS_CAJA",
                "Movimientos",
                "/cajas/movimientos",
                "ArrowLeftRight",
                2,
                "CAJAS"),

            new(
                "ARQUEOS_CIERRES",
                "Arqueos y Cierres",
                "/cajas/arqueos",
                "Calculator",
                3,
                "CAJAS"),


            // =========================================================
            // GESTIÓN HUMANA
            // =========================================================

            new(
                "GESTION_HUMANA",
                "Gestión Humana",
                null,
                null,
                4,
                null),

            new(
                "RECURSOS_HUMANOS",
                "Recursos Humanos",
                null,
                "Users",
                1,
                "GESTION_HUMANA"),

            new(
                "EMPLEADOS",
                "Empleados",
                "/recursos-humanos/empleados",
                "UserCheck",
                1,
                "RECURSOS_HUMANOS"),

            new(
                "MEDICOS",
                "Médicos",
                "/recursos-humanos/medicos",
                "HeartPulse",
                2,
                "RECURSOS_HUMANOS"),

            new(
                "CARGOS",
                "Cargos",
                "/recursos-humanos/cargos",
                "Briefcase",
                3,
                "RECURSOS_HUMANOS"),

            new(
                "ESPECIALIDADES",
                "Especialidades",
                "/recursos-humanos/especialidades",
                "Stethoscope",
                4,
                "RECURSOS_HUMANOS"),

            new(
                "TIPOS_AREA",
                "Tipos de Área",
                "/recursos-humanos/tipos-area",
                "Building2",
                5,
                "RECURSOS_HUMANOS"),

            new(
                "AREAS",
                "Áreas",
                "/recursos-humanos/areas",
                "Network",
                6,
                "RECURSOS_HUMANOS"),


            // =========================================================
            // CONFIGURACIÓN & SISTEMA
            // =========================================================

            new(
                "CONFIGURACION_SISTEMA",
                "Configuración & Sistema",
                null,
                null,
                5,
                null),

            new(
                "SEGURIDAD",
                "Seguridad",
                null,
                "Shield",
                1,
                "CONFIGURACION_SISTEMA"),

            new(
                "MI_PERFIL",
                "Mi Perfil",
                "/dashboard/perfil",
                "User",
                1,
                "SEGURIDAD"),

            new(
                "USUARIOS",
                "Usuarios",
                "/seguridad/usuarios",
                "Users",
                2,
                "SEGURIDAD"),

            new(
                "PERSONAS",
                "Personas",
                "/seguridad/personas",
                "User",
                3,
                "SEGURIDAD"),

            new(
                "ROLES_PERMISOS",
                "Roles y Permisos",
                "/seguridad/roles",
                "Key",
                4,
                "SEGURIDAD"),

            new(
                "OPCIONES_MENU",
                "Opciones de Menú",
                "/seguridad/opciones-menu",
                "ListTree",
                5,
                "SEGURIDAD"),

            new(
                "AUDITORIA_SISTEMA",
                "Auditoría de Sistema",
                "/seguridad/auditoria",
                "FileText",
                6,
                "SEGURIDAD"),

            new(
                "SESIONES_ACTIVAS",
                "Sesiones Activas",
                "/seguridad/sesiones",
                "Lock",
                7,
                "SEGURIDAD"),

            new(
                "PARAMETROS",
                "Parámetros",
                null,
                "Sliders",
                2,
                "CONFIGURACION_SISTEMA"),

            new(
                "CATALOGOS",
                "Catálogos",
                "/parametros/catalogos",
                "Database",
                1,
                "PARAMETROS"),

            new(
                "MONEDAS",
                "Monedas",
                "/parametros/monedas",
                "Coins",
                2,
                "PARAMETROS"),

            new(
                "METODOS_PAGO",
                "Métodos de Pago",
                "/parametros/metodos-pago",
                "CreditCard",
                3,
                "PARAMETROS"),

            new(
                "BANCOS_CUENTAS",
                "Bancos y Cuentas",
                "/parametros/bancos",
                "Landmark",
                4,
                "PARAMETROS"),

            new(
                "TIPO_CAMBIO",
                "Tipo de Cambio",
                "/parametros/tipo-cambio",
                "TrendingUp",
                5,
                "PARAMETROS"),

            new(
                "UNIDADES_MEDIDA",
                "Unidades de Medida",
                "/parametros/unidades-medida",
                "Scale",
                6,
                "PARAMETROS"),

            new(
                "CONFIGURACION_GENERAL",
                "Configuración General",
                "/parametros/general",
                "Settings",
                7,
                "PARAMETROS")
        ];
    }

    private sealed record SeedOpcionMenu(
        string Codigo,
        string Nombre,
        string? Ruta,
        string? Icono,
        int Orden,
        string? CodigoPadre);
}