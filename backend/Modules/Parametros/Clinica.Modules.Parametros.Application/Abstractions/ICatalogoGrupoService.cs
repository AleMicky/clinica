using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface ICatalogoGrupoService : ICrudService<Guid,
    CatalogoGrupoResponse,
    CreateCatalogoGrupoRequest,
    UpdateCatalogoGrupoRequest>
{
}