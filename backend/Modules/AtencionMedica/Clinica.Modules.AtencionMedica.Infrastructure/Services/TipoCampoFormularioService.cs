using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class TipoCampoFormularioService(AtencionMedicaDbContext context)
    : ITipoCampoFormularioService
{
    public async Task<PagedResult<TipoCampoFormularioResponse>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = context.TiposCampoFormulario.AsNoTracking();

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
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
        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new TipoCampoFormulario
        {
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            ControlFrontend = StringNormalize.Required(request.ControlFrontend),
            TipoDato = StringNormalize.Required(request.TipoDato),
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

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.ControlFrontend = StringNormalize.Required(request.ControlFrontend);
        entity.TipoDato = StringNormalize.Required(request.TipoDato);
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
