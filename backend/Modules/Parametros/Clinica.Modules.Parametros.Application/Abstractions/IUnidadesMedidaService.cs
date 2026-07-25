using Clinica.Modules.Parametros.Application.UnidadesMedida;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface IUnidadesMedidaService : ICrudService<Guid,
    UnidadesMedidaResponse,
    CreateUnidadesMedidaRequest,
    UpdateUnidadesMedidaRequest>
{
}
