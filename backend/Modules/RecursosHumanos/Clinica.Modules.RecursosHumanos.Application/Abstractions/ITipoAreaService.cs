using Clinica.Modules.RecursosHumanos.Application.TiposArea;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface ITipoAreaService : ICrudService<Guid,
    TipoAreaResponse,
    CreateTipoAreaRequest,
    UpdateTipoAreaRequest>
{
}
