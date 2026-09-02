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

        // 1. Obtener todas las opciones existentes en la base de datos
        var existentes = await dbContext.OpcionesMenu
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(
                x => x.Codigo,
                StringComparer.OrdinalIgnoreCase);

        var pendientes = seedOpciones.ToList();
        var huboCambios = false;

        // 2. Iterar e insertar/actualizar respetando la jerarquía (padre primero)
        while (pendientes.Count > 0)
        {
            var procesadosEnIteracion = 0;

            foreach (var seed in pendientes.ToList())
            {
                int? padreId = null;

                if (!string.IsNullOrWhiteSpace(seed.CodigoPadre))
                {
                    if (!porCodigo.TryGetValue(seed.CodigoPadre, out var padre))
                    {
                        // Esperar a que el padre esté procesado en una iteración previa
                        continue;
                    }

                    padreId = padre.Id;
                }

                if (porCodigo.TryGetValue(seed.Codigo, out var entidadExistente))
                {
                    // Actualizar si hubo cambios en la definición
                    var modificado = false;

                    if (entidadExistente.Nombre != seed.Nombre)
                    {
                        entidadExistente.Nombre = seed.Nombre;
                        modificado = true;
                    }

                    if (entidadExistente.Ruta != seed.Ruta)
                    {
                        entidadExistente.Ruta = seed.Ruta;
                        modificado = true;
                    }

                    if (entidadExistente.Icono != seed.Icono)
                    {
                        entidadExistente.Icono = seed.Icono;
                        modificado = true;
                    }

                    if (entidadExistente.Orden != seed.Orden)
                    {
                        entidadExistente.Orden = seed.Orden;
                        modificado = true;
                    }

                    if (entidadExistente.PadreId != padreId)
                    {
                        entidadExistente.PadreId = padreId;
                        modificado = true;
                    }

                    if (!entidadExistente.Activo)
                    {
                        entidadExistente.Activo = true;
                        modificado = true;
                    }

                    if (modificado)
                    {
                        entidadExistente.FechaModificacion = DateTime.UtcNow;
                        entidadExistente.ModificadoPor = "Seed";
                        huboCambios = true;
                    }
                }
                else
                {
                    // Insertar nueva opción
                    var entity = new OpcionMenu
                    {
                        PadreId = padreId,
                        Codigo = seed.Codigo,
                        Nombre = seed.Nombre,
                        Ruta = seed.Ruta,
                        Icono = seed.Icono,
                        Orden = seed.Orden,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow,
                        CreadoPor = "Seed"
                    };

                    dbContext.OpcionesMenu.Add(entity);
                    await dbContext.SaveChangesAsync();

                    porCodigo[entity.Codigo] = entity;
                    huboCambios = true;
                }

                pendientes.Remove(seed);
                procesadosEnIteracion++;
            }

            if (procesadosEnIteracion == 0 && pendientes.Count > 0)
            {
                var faltantes = string.Join(
                    ", ",
                    pendientes.Select(x => x.Codigo));

                throw new InvalidOperationException(
                    $"No se pudieron insertar o actualizar las opciones de menú: {faltantes}. Verifique los códigos padre.");
            }
        }

        if (huboCambios)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static List<SeedOpcionMenu> BuildSeedOpciones()
    {
        return
        [
            // =========================================================
            // 1. PRINCIPAL
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

            // =========================================================
            // 2. CLÍNICA & SERVICIOS
            // =========================================================
            new(
                "CLINICA_SERVICIOS",
                "Clínica & Servicios",
                null,
                null,
                2,
                null),

            new(
                "PACIENTES",
                "Pacientes",
                "/recepcion/pacientes",
                "User",
                1,
                "CLINICA_SERVICIOS"),

            new(
                "ADMISIONES",
                "Admisiones",
                "/recepcion/admisiones",
                "ClipboardList",
                2,
                "CLINICA_SERVICIOS"),

            new(
                "SERVICIOS",
                "Servicios Médicos",
                null,
                "Stethoscope",
                3,
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
            // 3. CAJA & VENTAS
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
                "Punto de Venta",
                "/ventas",
                "Coins",
                1,
                "CAJA_VENTAS"),

            new(
                "COBROS",
                "Cobros",
                "/caja/cobros",
                "CreditCard",
                2,
                "CAJA_VENTAS"),

            new(
                "ARQUEOS_CIERRES",
                "Arqueos y Cierres",
                "/caja/arqueos",
                "Calculator",
                3,
                "CAJA_VENTAS"),

            new(
                "TUR-CA",
                "Turnos de Caja",
                "/caja/turnos",
                "Clock",
                4,
                "CAJA_VENTAS"),

            new(
                "MOVIMIENTOS_CAJA",
                "Movimientos de Caja",
                "/caja/movimientos",
                "ArrowLeftRight",
                5,
                "CAJA_VENTAS"),

            new(
                "CONF",
                "Configuración de Caja",
                null,
                "Settings",
                6,
                "CAJA_VENTAS"),

            new(
                "PUNTOS_CAJA",
                "Puntos de Caja",
                "/caja/configuracion/cajas",
                "Vault",
                1,
                "CONF"),

            // =========================================================
            // 4. LOGÍSTICA & ALMACENES
            // =========================================================
            new(
                "LOGISTICA_ALMACENES",
                "Logística & Almacenes",
                null,
                null,
                4,
                null),

            new(
                "ALMACENES_MODULO",
                "Inventario & Catálogo",
                null,
                "Boxes",
                1,
                "LOGISTICA_ALMACENES"),

            new(
                "ALMACEN_PUNTOS",
                "Almacenes",
                "/almacenes/almacen",
                "Warehouse",
                1,
                "ALMACENES_MODULO"),

            new(
                "CATEGORIAS_PRODUCTO",
                "Categorías de Producto",
                "/almacenes/categorias-producto",
                "Layers",
                2,
                "ALMACENES_MODULO"),

            new(
                "PRODUCTOS",
                "Productos",
                "/almacenes/productos",
                "Package",
                3,
                "ALMACENES_MODULO"),

            new(
                "EXISTENCIAS",
                "Existencias / Stock",
                "/almacenes/existencias",
                "Boxes",
                4,
                "ALMACENES_MODULO"),

            new(
                "TIPOS_MOVIMIENTO",
                "Tipos de Movimiento",
                "/almacenes/tipos-movimiento",
                "SlidersHorizontal",
                5,
                "ALMACENES_MODULO"),

            new(
                "OPERACIONES_ALMACEN",
                "Operaciones de Stock",
                null,
                "ArrowLeftRight",
                2,
                "LOGISTICA_ALMACENES"),

            new(
                "MOVIMIENTOS_INVENTARIO",
                "Movimientos",
                "/almacenes/movimientos",
                "ArrowDownUp",
                1,
                "OPERACIONES_ALMACEN"),

            new(
                "TRANSFERENCIAS_ALMACEN",
                "Transferencias",
                "/almacenes/transferencias",
                "ArrowLeftRight",
                2,
                "OPERACIONES_ALMACEN"),

            new(
                "AJUSTES_INVENTARIO",
                "Ajustes de Inventario",
                "/almacenes/ajustes",
                "Sliders",
                3,
                "OPERACIONES_ALMACEN"),

            new(
                "BAJAS_INVENTARIO",
                "Bajas de Inventario",
                "/almacenes/bajas",
                "FileText",
                4,
                "OPERACIONES_ALMACEN"),

            new(
                "CONSUMOS_INTERNOS",
                "Consumos Internos",
                "/almacenes/consumos",
                "ClipboardList",
                5,
                "OPERACIONES_ALMACEN"),

            new(
                "INVENTARIOS_FISICOS",
                "Inventarios Físicos",
                "/almacenes/inventarios-fisicos",
                "ClipboardCheck",
                6,
                "OPERACIONES_ALMACEN"),

            // =========================================================
            // 5. COMPRAS
            // =========================================================
            new(
                "COMPRAS",
                "Compras",
                null,
                null,
                5,
                null),

            new(
                "PROVEEDORES",
                "Proveedores",
                "/compras/proveedores",
                "Building2",
                1,
                "COMPRAS"),

            new(
                "SOLICITUDES_COMPRA",
                "Solicitudes de Compra",
                "/compras/solicitudes-compra",
                "ClipboardList",
                2,
                "COMPRAS"),

            new(
                "COTIZACIONES_COMPRA",
                "Cotizaciones de Compra",
                "/compras/cotizaciones-compra",
                "Receipt",
                3,
                "COMPRAS"),

            new(
                "ORDENES_COMPRA",
                "Órdenes de Compra",
                "/compras/ordenes-compra",
                "FileText",
                4,
                "COMPRAS"),

            new(
                "RECEPCIONES_COMPRA",
                "Recepciones de Compra",
                "/compras/recepciones-compra",
                "PackageCheck",
                5,
                "COMPRAS"),

            new(
                "DEVOLUCIONES_PROVEEDOR",
                "Devoluciones a Proveedor",
                "/compras/devoluciones-proveedor",
                "ArrowLeftRight",
                6,
                "COMPRAS"),

            // =========================================================
            // 6. GESTIÓN HUMANA
            // =========================================================
            new(
                "GESTION_HUMANA",
                "Gestión Humana",
                null,
                null,
                6,
                null),

            new(
                "RECURSOS_HUMANOS",
                "Personal & Médicos",
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
                "ASIGNACIONES_EMPLEADO",
                "Asignaciones de Empleado",
                "/recursos-humanos/asignaciones-empleado",
                "UserCog",
                3,
                "RECURSOS_HUMANOS"),

            new(
                "ESTRUCTURA_ORGANIZACIONAL",
                "Estructura Organizacional",
                null,
                "Building2",
                2,
                "GESTION_HUMANA"),

            new(
                "CARGOS",
                "Cargos",
                "/recursos-humanos/cargos",
                "Briefcase",
                1,
                "ESTRUCTURA_ORGANIZACIONAL"),

            new(
                "ESPECIALIDADES",
                "Especialidades",
                "/recursos-humanos/especialidades",
                "Stethoscope",
                2,
                "ESTRUCTURA_ORGANIZACIONAL"),

            new(
                "AREAS",
                "Áreas",
                "/recursos-humanos/areas",
                "Network",
                3,
                "ESTRUCTURA_ORGANIZACIONAL"),

            new(
                "TIPOS_AREA",
                "Tipos de Área",
                "/recursos-humanos/tipos-area",
                "Layers",
                4,
                "ESTRUCTURA_ORGANIZACIONAL"),

            // =========================================================
            // 7. CONFIGURACIÓN & SISTEMA
            // =========================================================
            new(
                "CONFIGURACION_SISTEMA",
                "Configuración & Sistema",
                null,
                null,
                7,
                null),

            new(
                "SEGURIDAD",
                "Seguridad & Accesos",
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
                "UserPlus",
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
                "PARAMETROS",
                "Parámetros Generales",
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