using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Jerarquia;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class JerarquiaOrganizacionalService(
    RecursosHumanosDbContext context
) : IJerarquiaOrganizacionalService
{
    public async Task<JerarquiaOrganizacionalResponse> GetAsync(
        JerarquiaOrganizacionalRequest request,
        CancellationToken cancellationToken = default)
    {
        var areas = await context.Areas
            .AsNoTracking()
            .Include(x => x.Departamentos)
            .ThenInclude(x => x.Servicios)
            .OrderBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        Dictionary<Guid, int>? areaCounts = null;
        Dictionary<Guid, int>? departamentoCounts = null;
        Dictionary<Guid, int>? servicioCounts = null;

        if (request.IncludeCounts)
        {
            var empleados = context.Set<Empleado>().AsNoTracking();

            areaCounts = await empleados
                .GroupBy(x => x.AreaId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, cancellationToken);

            departamentoCounts = await empleados
                .GroupBy(x => x.DepartamentoId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, cancellationToken);

            servicioCounts = await empleados
                .GroupBy(x => x.ServicioId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, cancellationToken);
        }

        var nodes = areas
            .Select(area => new JerarquiaAreaNode(
                area.Id,
                area.Codigo,
                area.Nombre,
                area.Descripcion ?? string.Empty,
                request.IncludeCounts
                    ? areaCounts!.GetValueOrDefault(area.Id)
                    : null,
                area.Departamentos
                    .OrderBy(x => x.Nombre)
                    .Select(departamento => new JerarquiaDepartamentoNode(
                        departamento.Id,
                        departamento.AreaId,
                        departamento.Codigo,
                        departamento.Nombre,
                        departamento.Descripcion ?? string.Empty,
                        request.IncludeCounts
                            ? departamentoCounts!.GetValueOrDefault(departamento.Id)
                            : null,
                        departamento.Servicios
                            .OrderBy(x => x.Nombre)
                            .Select(servicio => new JerarquiaServicioNode(
                                servicio.Id,
                                servicio.DepartamentoId,
                                servicio.Codigo,
                                servicio.Nombre,
                                servicio.Descripcion ?? string.Empty,
                                request.IncludeCounts
                                    ? servicioCounts!.GetValueOrDefault(servicio.Id)
                                    : null))
                            .ToList()))
                    .ToList()))
            .ToList();

        return new JerarquiaOrganizacionalResponse(nodes);
    }
}
