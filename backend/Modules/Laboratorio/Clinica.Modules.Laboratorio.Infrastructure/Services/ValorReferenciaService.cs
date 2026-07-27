using System.Linq.Expressions;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.ValoresReferencia;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class ValorReferenciaService(LaboratorioDbContext context) : IValorReferenciaService
{
    private const string NotFoundMessage = "Valor de referencia no encontrado.";

    public Task<PagedResult<ValorReferenciaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ValorReferenciaPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<ValorReferenciaResponse>> GetPagedAsync(
        ValorReferenciaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.ValoresReferencia.AsNoTracking();

        if (request.ParametroId is { } parametroId && parametroId != Guid.Empty)
            query = query.Where(x => x.ParametroId == parametroId);

        return await query
            .OrderBy(x => x.Sexo)
            .ThenBy(x => x.EdadMin)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<ValorReferenciaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.ValoresReferencia
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ValorReferenciaResponse> CreateAsync(
        CreateValorReferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureParametroExistsAsync(request.ParametroId, cancellationToken);
        ValidateRangos(request.EdadMin, request.EdadMax, request.ValorMin, request.ValorMax);

        var entity = new ValorReferencia
        {
            ParametroId = request.ParametroId,
            Sexo = StringNormalize.Optional(request.Sexo),
            EdadMin = request.EdadMin,
            EdadMax = request.EdadMax,
            ValorMin = request.ValorMin,
            ValorMax = request.ValorMax,
            ValorTexto = StringNormalize.Optional(request.ValorTexto),
            Activo = request.Activo,
        };

        context.ValoresReferencia.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ValorReferenciaResponse> UpdateAsync(
        Guid id,
        UpdateValorReferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ValoresReferencia.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        await EnsureParametroExistsAsync(request.ParametroId, cancellationToken);
        ValidateRangos(request.EdadMin, request.EdadMax, request.ValorMin, request.ValorMax);

        entity.ParametroId = request.ParametroId;
        entity.Sexo = StringNormalize.Optional(request.Sexo);
        entity.EdadMin = request.EdadMin;
        entity.EdadMax = request.EdadMax;
        entity.ValorMin = request.ValorMin;
        entity.ValorMax = request.ValorMax;
        entity.ValorTexto = StringNormalize.Optional(request.ValorTexto);
        entity.Activo = request.Activo;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ValoresReferencia.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        context.ValoresReferencia.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateRangos(
        int? edadMin,
        int? edadMax,
        decimal? valorMin,
        decimal? valorMax)
    {
        if (edadMin is { } min1 && edadMax is { } max1 && min1 > max1)
            throw new BusinessException("La edad mínima no puede ser mayor a la edad máxima.");

        if (valorMin is { } min2 && valorMax is { } max2 && min2 > max2)
            throw new BusinessException("El valor mínimo no puede ser mayor al valor máximo.");
    }

    private static Expression<Func<ValorReferencia, ValorReferenciaResponse>> ProjectToResponse =>
        x => new ValorReferenciaResponse(
            x.Id,
            x.ParametroId,
            x.Sexo,
            x.EdadMin,
            x.EdadMax,
            x.ValorMin,
            x.ValorMax,
            x.ValorTexto,
            x.Activo);

    private async Task EnsureParametroExistsAsync(
        Guid parametroId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Parametros
            .AnyAsync(x => x.Id == parametroId, cancellationToken);

        if (!exists)
            throw new BusinessException("El parámetro no existe.");
    }
}
