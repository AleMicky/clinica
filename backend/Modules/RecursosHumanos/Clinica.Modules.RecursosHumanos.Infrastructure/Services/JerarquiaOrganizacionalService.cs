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
            .OrderBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        Dictionary<Guid, int>? areaCounts = null;

        if (request.IncludeCounts)
        {
            areaCounts = await context.Empleados
                .AsNoTracking()
                .GroupBy(x => x.AreaId)
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
                    : null))
            .ToList();

        return new JerarquiaOrganizacionalResponse(nodes);
    }
}
