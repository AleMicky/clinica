using Clinica.Modules.AtencionMedica.Application.TiposAtencion;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface ITipoAtencionService : ICrudService<Guid,
    TipoAtencionResponse,
    CreateTipoAtencionRequest,
    UpdateTipoAtencionRequest>
{
}
