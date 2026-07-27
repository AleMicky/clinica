using System.Linq.Expressions;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Parametros;
using Clinica.Modules.Laboratorio.Domain.Constants;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class ParametroService(LaboratorioDbContext context) : IParametroService
{
    private const string NotFoundMessage = "Parámetro no encontrado.";
    private const string DuplicateCodigoMessage = "El código ya existe para esta prueba.";

    public Task<PagedResult<ParametroResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ParametroPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<ParametroResponse>> GetPagedAsync(
        ParametroPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Parametros.AsNoTracking();

        if (request.PruebaId is { } pruebaId && pruebaId != Guid.Empty)
            query = query.Where(x => x.PruebaId == pruebaId);

        return await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<ParametroResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Parametros
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ParametroResponse> CreateAsync(
        CreateParametroRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);
        var tipoDato = ValidateTipoDato(request.TipoDato);

        await EnsurePruebaExistsAsync(request.PruebaId, cancellationToken);
        await EnsureUnidadMedidaExistsAsync(request.UnidadMedidaId, cancellationToken);
        await EnsureCodigoIsUniqueAsync(request.PruebaId, codigo, null, cancellationToken);

        var entity = new Parametro
        {
            PruebaId = request.PruebaId,
            Codigo = codigo,
            Nombre = nombre,
            UnidadMedidaId = request.UnidadMedidaId,
            TipoDato = tipoDato,
            Orden = request.Orden,
            Activo = request.Activo,
        };

        context.Parametros.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ParametroResponse> UpdateAsync(
        Guid id,
        UpdateParametroRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Parametros.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);
        var tipoDato = ValidateTipoDato(request.TipoDato);

        await EnsureUnidadMedidaExistsAsync(request.UnidadMedidaId, cancellationToken);
        await EnsureCodigoIsUniqueAsync(entity.PruebaId, codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = nombre;
        entity.UnidadMedidaId = request.UnidadMedidaId;
        entity.TipoDato = tipoDato;
        entity.Orden = request.Orden;
        entity.Activo = request.Activo;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Parametros.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        context.Parametros.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static string ValidateTipoDato(string tipoDato)
    {
        var normalized = StringNormalize.Required(tipoDato).ToUpperInvariant();

        if (!ParametroTiposDato.All.Contains(normalized))
            throw new BusinessException(
                $"TipoDato debe ser uno de: {string.Join(", ", ParametroTiposDato.All)}.");

        return normalized;
    }

    private static Expression<Func<Parametro, ParametroResponse>> ProjectToResponse =>
        x => new ParametroResponse(
            x.Id,
            x.PruebaId,
            x.Prueba.Nombre,
            x.Codigo,
            x.Nombre,
            x.UnidadMedidaId,
            x.TipoDato,
            x.Orden,
            x.Activo);

    private async Task EnsurePruebaExistsAsync(
        Guid pruebaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Pruebas
            .AnyAsync(x => x.Id == pruebaId, cancellationToken);

        if (!exists)
            throw new BusinessException("La prueba no existe.");
    }

    private async Task EnsureUnidadMedidaExistsAsync(
        Guid? unidadMedidaId,
        CancellationToken cancellationToken)
    {
        if (unidadMedidaId is not { } id || id == Guid.Empty)
            return;

        var exists = await context.Set<UnidadesMedida>()
            .AnyAsync(x => x.Id == id, cancellationToken);

        if (!exists)
            throw new BusinessException("La unidad de medida no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid pruebaId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.Parametros.EnsureUniqueAsync(
            UniqueCodigoPorPruebaPredicate(pruebaId, codigo, currentId),
            DuplicateCodigoMessage,
            cancellationToken);
    }

    private static Expression<Func<Parametro, bool>> UniqueCodigoPorPruebaPredicate(
        Guid pruebaId,
        string codigo,
        Guid? currentId)
    {
        if (currentId is { } id)
            return x => x.PruebaId == pruebaId && x.Codigo == codigo && x.Id != id;

        return x => x.PruebaId == pruebaId && x.Codigo == codigo;
    }
}
