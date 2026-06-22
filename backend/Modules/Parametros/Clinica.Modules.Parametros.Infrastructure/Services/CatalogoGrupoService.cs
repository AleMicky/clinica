using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public class CatalogoGrupoService : ICatalogoGrupoService
{
    private readonly IRepository<CatalogoGrupo> _repository;
    private readonly ParametrosDbContext _context;

    public CatalogoGrupoService(IRepository<CatalogoGrupo> repository, ParametrosDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<CatalogoGrupoResponse> CreateAsync(
        CreateCatalogoGrupoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (await CodigoExistsAsync(request.Codigo, cancellationToken: cancellationToken))
        {
            throw new ArgumentException($"El código '{request.Codigo}' ya existe.");
        }

        var grupo = CatalogoGrupo.Create(request.Codigo, request.Nombre, request.Descripcion);
        await _repository.AddAsync(grupo, cancellationToken);

        return MapToResponse(grupo);
    }

    public async Task<IReadOnlyList<CatalogoGrupoResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var grupos = await _repository.GetAllAsync(cancellationToken);

        return grupos
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<CatalogoGrupoResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var grupo = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(CatalogoGrupo), id);

        return MapToResponse(grupo);
    }

    public async Task<CatalogoGrupoResponse> UpdateAsync(
        Guid id,
        UpdateCatalogoGrupoRequest request,
        CancellationToken cancellationToken = default)
    {
        var grupo = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(CatalogoGrupo), id);

        if (await CodigoExistsAsync(request.Codigo, id, cancellationToken))
        {
            throw new ArgumentException($"El código '{request.Codigo}' ya existe.");
        }

        grupo.Update(request.Codigo, request.Nombre, request.Descripcion);
        await _repository.UpdateAsync(grupo, cancellationToken);

        return MapToResponse(grupo);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var grupo = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(CatalogoGrupo), id);

        await _repository.DeleteAsync(grupo, cancellationToken);
    }

    private async Task<bool> CodigoExistsAsync(
        string codigo,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        return await _context.CatalogoGrupos
            .AnyAsync(
                g => g.Codigo == codigo && (!excludeId.HasValue || g.Id != excludeId.Value),
                cancellationToken);
    }

    private static CatalogoGrupoResponse MapToResponse(CatalogoGrupo grupo)
    {
        return new CatalogoGrupoResponse(grupo.Id, grupo.Codigo, grupo.Nombre, grupo.Descripcion);
    }
}
