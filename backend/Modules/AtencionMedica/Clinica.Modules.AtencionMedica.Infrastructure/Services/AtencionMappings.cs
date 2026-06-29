using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

internal static class AtencionMappings
{
    public static AtencionResponse ToResponse(AtencionEntity entity) =>
        new(
            entity.Id,
            entity.NumeroAtencion,
            entity.PacienteId,
            entity.TipoAtencionId,
            entity.ServicioId,
            entity.EspecialidadId,
            entity.MedicoId,
            entity.MotivoConsulta,
            entity.FormularioClinicoId,
            entity.FechaAtencion,
            entity.FechaRecepcion,
            entity.Estado,
            entity.WorkflowInstanceId,
            entity.ResponsableFinancieroNombre,
            entity.ResponsableFinancieroDocumento,
            entity.ResponsableFinancieroTelefono,
            entity.SeguroNombre,
            entity.NumeroAfiliacion,
            entity.Observaciones);
}
