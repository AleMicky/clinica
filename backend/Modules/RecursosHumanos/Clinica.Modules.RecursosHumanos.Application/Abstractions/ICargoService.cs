using Clinica.Modules.RecursosHumanos.Application.Cargos;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface ICargoService : ICrudService<Guid,
    CargoResponse,
    CreateCargoRequest,
    UpdateCargoRequest>
{
}
