using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class TipoCampoFormularioService(AtencionMedicaDbContext context)
    : ITipoCampoFormularioService
{
    public async Task<PagedResult<TipoCampoFormularioResponse>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.TiposCampoFormulario.AsNoTracking();
        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<TipoCampoFormularioResponse>(items, total, page, pageSize);
    }
    
    public async Task<TipoCampoFormularioResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.TiposCampoFormulario
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<TipoCampoFormularioResponse> CreateAsync(CreateTipoCampoFormularioRequest request, CancellationToken cancellationToken = default)
    {
        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new TipoCampoFormulario
        {
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            ControlFrontend = Normalize(request.ControlFrontend),
            TipoDato = Normalize(request.TipoDato),
            PermiteOpciones = request.PermiteOpciones,
            PermiteValorDefecto = request.PermiteValorDefecto,
            PermiteValidaciones = request.PermiteValidaciones,
            PermiteMultiple = request.PermiteMultiple
        };

        context.TiposCampoFormulario.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<TipoCampoFormularioResponse> UpdateAsync(Guid id, UpdateTipoCampoFormularioRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await context.TiposCampoFormulario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Tipo de campo de formulario no encontrado.");

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.ControlFrontend = Normalize(request.ControlFrontend);
        entity.TipoDato = Normalize(request.TipoDato);
        entity.PermiteOpciones = request.PermiteOpciones;
        entity.PermiteValorDefecto = request.PermiteValorDefecto;
        entity.PermiteValidaciones = request.PermiteValidaciones;
        entity.PermiteMultiple = request.PermiteMultiple;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.TiposCampoFormulario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Tipo de campo de formulario no encontrado.");

        context.TiposCampoFormulario.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(string codigo, Guid? currentId, CancellationToken cancellationToken)
    {
        var exists = await context.TiposCampoFormulario.AnyAsync(
            x => x.Codigo == codigo && (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static TipoCampoFormularioResponse ToResponse(TipoCampoFormulario entity) =>
        new(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.ControlFrontend,
            entity.TipoDato,
            entity.PermiteOpciones,
            entity.PermiteValorDefecto,
            entity.PermiteValidaciones,
            entity.PermiteMultiple);
}
