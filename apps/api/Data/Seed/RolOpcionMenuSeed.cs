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

        var adminRol = await dbContext.Roles
            .FirstOrDefaultAsync(r => r.NormalizedName == "ADMINISTRADOR" || r.Name == "Administrador");

        if (adminRol == null)
        {
            return;
        }

        var opciones = await dbContext.OpcionesMenu
            .Where(o => o.Activo)
            .ToListAsync();

        var asignacionesExistentes = await dbContext.Set<RolOpcionMenu>()
            .Where(x => x.RolId == adminRol.Id)
            .Select(x => x.OpcionMenuId)
            .ToListAsync();

        var asignacionesSet = new HashSet<int>(asignacionesExistentes);
        var nuevasAsignaciones = new List<RolOpcionMenu>();

        foreach (var opcion in opciones)
        {
            if (!asignacionesSet.Contains(opcion.Id))
            {
                nuevasAsignaciones.Add(new RolOpcionMenu
                {
                    RolId = adminRol.Id,
                    OpcionMenuId = opcion.Id,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    CreadoPor = "Seed"
                });
            }
        }

        if (nuevasAsignaciones.Count > 0)
        {
            await dbContext.Set<RolOpcionMenu>().AddRangeAsync(nuevasAsignaciones);
            await dbContext.SaveChangesAsync();
        }

        // Asegurar opciones operativas de turno personal para el rol CAJA
        var cajaRol = await dbContext.Roles
            .FirstOrDefaultAsync(r => r.NormalizedName == "CAJA" || r.Name == "CAJA");

        if (cajaRol != null)
        {
            var codigosCaja = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "PRINCIPAL",
                "INICIO",
                "CAJA_VENTAS",
                "MI_TURNO_CAJA",
                "COBROS",
                "ARQUEOS_CIERRES",
                "MOVIMIENTOS_CAJA"
            };

            var opcionesCaja = opciones
                .Where(o => codigosCaja.Contains(o.Codigo))
                .ToList();

            var asignacionesCajaExistentes = await dbContext.Set<RolOpcionMenu>()
                .Where(x => x.RolId == cajaRol.Id)
                .Select(x => x.OpcionMenuId)
                .ToListAsync();

            var asignacionesCajaSet = new HashSet<int>(asignacionesCajaExistentes);
            var nuevasAsignacionesCaja = new List<RolOpcionMenu>();

            foreach (var opcion in opcionesCaja)
            {
                if (!asignacionesCajaSet.Contains(opcion.Id))
                {
                    nuevasAsignacionesCaja.Add(new RolOpcionMenu
                    {
                        RolId = cajaRol.Id,
                        OpcionMenuId = opcion.Id,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow,
                        CreadoPor = "Seed"
                    });
                }
            }

            if (nuevasAsignacionesCaja.Count > 0)
            {
                await dbContext.Set<RolOpcionMenu>().AddRangeAsync(nuevasAsignacionesCaja);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
