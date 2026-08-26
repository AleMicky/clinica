using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class RolOpcionMenuSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var roles = await dbContext.Roles
            .ToListAsync();

        var opciones = await dbContext.OpcionesMenu
            .Where(o => o.Activo)
            .ToListAsync();

        var opcionesPorCodigo = opciones
            .ToDictionary(o => o.Codigo, StringComparer.OrdinalIgnoreCase);

        var opcionesPorId = opciones
            .ToDictionary(o => o.Id);

        var asignacionesExistentes = await dbContext.Set<RolOpcionMenu>()
            .ToListAsync();

        var asignacionesSet = new HashSet<string>(
            asignacionesExistentes.Select(x => $"{x.RolId}_{x.OpcionMenuId}"));

        var rolMap = roles.ToDictionary(
            r => r.NormalizedName ?? r.Name!.ToUpperInvariant(),
            StringComparer.OrdinalIgnoreCase);

        var configuracionRoles = ObtenerConfiguracionRoles();
        var nuevasAsignaciones = new List<RolOpcionMenu>();

        foreach (var (nombreRol, codigosOpciones) in configuracionRoles)
        {
            if (!rolMap.TryGetValue(nombreRol, out var rol))
                continue;

            var idsAAsignar = new HashSet<int>();

            if (codigosOpciones.Contains("*"))
            {
                // Asignar todas las opciones activas (e.g. ADMINISTRADOR)
                foreach (var op in opciones)
                {
                    idsAAsignar.Add(op.Id);
                }
            }
            else
            {
                // Resolver códigos específicos y asegurar ancestros/padres
                foreach (var codigo in codigosOpciones)
                {
                    if (opcionesPorCodigo.TryGetValue(codigo, out var opcion))
                    {
                        idsAAsignar.Add(opcion.Id);
                        AgregarPadresRecursivo(opcion, opcionesPorId, idsAAsignar);
                    }
                }
            }

            foreach (var opcionId in idsAAsignar)
            {
                var key = $"{rol.Id}_{opcionId}";
                if (!asignacionesSet.Contains(key))
                {
                    nuevasAsignaciones.Add(new RolOpcionMenu
                    {
                        RolId = rol.Id,
                        OpcionMenuId = opcionId,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow,
                        CreadoPor = "Seed"
                    });
                    asignacionesSet.Add(key);
                }
            }
        }

        if (nuevasAsignaciones.Count > 0)
        {
            await dbContext.Set<RolOpcionMenu>().AddRangeAsync(nuevasAsignaciones);
            await dbContext.SaveChangesAsync();
        }
    }

    private static void AgregarPadresRecursivo(
        OpcionMenu opcion,
        Dictionary<int, OpcionMenu> opcionesPorId,
        HashSet<int> ids)
    {
        var actualPadreId = opcion.PadreId;
        while (actualPadreId.HasValue && opcionesPorId.TryGetValue(actualPadreId.Value, out var padre))
        {
            ids.Add(padre.Id);
            actualPadreId = padre.PadreId;
        }
    }

    private static Dictionary<string, List<string>> ObtenerConfiguracionRoles()
    {
        return new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
        {
            ["ADMINISTRADOR"] = ["*"],

            ["RECEPCION"] =
            [
                "INICIO",
                "PACIENTES",
                "ADMISIONES",
                "VENTAS",
                "MI_PERFIL"
            ],

            ["CAJA"] =
            [
                "INICIO",
                "VENTAS",
                "COBROS",
                "ARQUEOS_CIERRES",
                "TUR-CA",
                "MOVIMIENTOS_CAJA",
                "PUNTOS_CAJA",
                "MI_PERFIL"
            ],

            ["RECURSOS_HUMANOS"] =
            [
                "INICIO",
                "EMPLEADOS",
                "MEDICOS",
                "CARGOS",
                "ESPECIALIDADES",
                "TIPOS_AREA",
                "AREAS",
                "ASIGNACIONES_EMPLEADO",
                "MI_PERFIL"
            ],

            ["FARMACIA"] =
            [
                "INICIO",
                "MI_PERFIL"
            ],

            ["ALMACEN"] =
            [
                "INICIO",
                "MI_PERFIL"
            ]
        };
    }
}
