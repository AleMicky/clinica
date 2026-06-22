using Clinica.Modules.Parametros.Application.CatalogoGrupos;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface ICatalogoGrupoService
{
    Task<CatalogoGrupoResponse> CreateAsync(CreateCatalogoGrupoRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CatalogoGrupoResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<CatalogoGrupoResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<CatalogoGrupoResponse> UpdateAsync(Guid id, UpdateCatalogoGrupoRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
