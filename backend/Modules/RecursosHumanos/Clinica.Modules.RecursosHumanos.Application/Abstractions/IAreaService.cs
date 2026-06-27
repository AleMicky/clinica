using Clinica.Modules.RecursosHumanos.Application.Areas;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IAreaService : ICrudService<Guid,
    AreaResponse,
    CreateAreaRequest,
    UpdateAreaRequest>
{
}
