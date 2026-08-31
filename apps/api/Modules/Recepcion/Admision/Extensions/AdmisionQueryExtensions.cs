
using Microsoft.EntityFrameworkCore;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;

namespace Clinica.Api.Modules.Recepcion.Admision.Extensions;

public static class AdmisionQueryExtensions
{
    public static IQueryable<AdmisionEntity> IncludeGrafoCompleto(this IQueryable<AdmisionEntity> query)
    {
        return query
            .Include(x => x.Paciente)
            .ThenInclude(x => x.Persona)
            .Include(x => x.Recepcionista)
            .ThenInclude(x => x.Persona)
            .Include(x => x.Convenio)
            .Include(x => x.Detalles)
            .ThenInclude(x => x.Servicio)
            .Include(x => x.Detalles)
            .ThenInclude(x => x.Medico)
            .ThenInclude(x => x.Empleado)
            .ThenInclude(x => x.Persona);
    }
}