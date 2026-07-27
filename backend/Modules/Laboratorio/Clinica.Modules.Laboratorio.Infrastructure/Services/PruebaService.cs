using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Pruebas;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class PruebaService(LaboratorioDbContext context) : IPruebaService
{
    private const string NotFoundMessage = "Prueba no encontrada.";
    private const string DuplicateCodigoMessage = "El código ya existe.";

    public async Task<PagedResult<PruebaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await context.Pruebas
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<PruebaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Pruebas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PruebaResponse> CreateAsync(
        CreatePruebaRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);

        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);
        await EnsureTipoExamenExistsAsync(request.TipoExamenId, cancellationToken);
        await EnsureTipoMuestraExistsAsync(request.TipoMuestraId, cancellationToken);

        var entity = new Prueba
        {
            Codigo = codigo,
            Nombre = nombre,
            EspecialidadId = request.EspecialidadId,
            TipoExamenId = request.TipoExamenId,
            TipoMuestraId = request.TipoMuestraId,
            RequiereAyuno = request.RequiereAyuno,
            HorasAyuno = request.RequiereAyuno ? request.HorasAyuno : null,
            EsDerivable = request.EsDerivable,
        };

        context.Pruebas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<PruebaResponse> UpdateAsync(
        Guid id,
        UpdatePruebaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pruebas.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);

        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);
        await EnsureTipoExamenExistsAsync(request.TipoExamenId, cancellationToken);
        await EnsureTipoMuestraExistsAsync(request.TipoMuestraId, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = nombre;
        entity.EspecialidadId = request.EspecialidadId;
        entity.TipoExamenId = request.TipoExamenId;
        entity.TipoMuestraId = request.TipoMuestraId;
        entity.RequiereAyuno = request.RequiereAyuno;
        entity.HorasAyuno = request.RequiereAyuno ? request.HorasAyuno : null;
        entity.EsDerivable = request.EsDerivable;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pruebas.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        context.Pruebas.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static System.Linq.Expressions.Expression<Func<Prueba, PruebaResponse>> ProjectToResponse =>
        x => new PruebaResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.EspecialidadId,
            x.Especialidad.Nombre,
            x.TipoExamenId,
            x.TipoExamen.Nombre,
            x.TipoMuestraId,
            x.TipoMuestra.Nombre,
            x.RequiereAyuno,
            x.HorasAyuno,
            x.EsDerivable);

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.Pruebas.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<Prueba>(codigo, currentId),
            DuplicateCodigoMessage,
            cancellationToken);
    }

    private async Task EnsureEspecialidadExistsAsync(
        Guid especialidadId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Especialidades
            .AnyAsync(x => x.Id == especialidadId, cancellationToken);

        if (!exists)
            throw new BusinessException("La especialidad no existe.");
    }

    private async Task EnsureTipoExamenExistsAsync(
        Guid tipoExamenId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposExamen
            .AnyAsync(x => x.Id == tipoExamenId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de examen no existe.");
    }

    private async Task EnsureTipoMuestraExistsAsync(
        Guid tipoMuestraId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<CatalogoItem>()
            .AnyAsync(x => x.Id == tipoMuestraId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de muestra no existe.");
    }
}
