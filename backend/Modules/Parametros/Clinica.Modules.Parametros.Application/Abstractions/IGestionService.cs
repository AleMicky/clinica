using Clinica.Modules.Parametros.Application.Gestiones;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface IGestionService : ICrudService<Guid,
    GestionResponse,
    CreateGestionRequest,
    UpdateGestionRequest>
{
}
