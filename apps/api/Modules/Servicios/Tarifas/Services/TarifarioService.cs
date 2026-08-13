using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Clinica.Api.Modules.Servicios.Tarifas.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using TarifarioEntity = Clinica.Api.Modules.Servicios.Tarifas.Entity.Tarifario;

namespace Clinica.Api.Modules.Servicios.Tarifas.Services;

public sealed class TarifarioService(AppDbContext dbContext)
    : CrudService<
        TarifarioEntity,
        CreateTarifarioRequest,
        UpdateTarifarioRequest,
        TarifarioResponse
    >(dbContext)
{
    public override async Task<TarifarioResponse> CrearAsync(
        CreateTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCreateAsync(request, cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrosPrincipalesAsync(cancellationToken);
        }

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<TarifarioResponse> ActualizarAsync(
        int id,
        UpdateTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        var eraPrincipal = entity.EsPrincipal;

        await ValidateUpdateAsync(
            id,
            request,
            entity,
            cancellationToken);

        MapToExistingEntity(request, entity);

        // Guard: no se puede desmarcar el único tarifario principal.
        if (eraPrincipal && !entity.EsPrincipal)
        {
            var hayOtroPrincipal = await Entities.AnyAsync(
                x => x.EsPrincipal && x.Id != id,
                cancellationToken);

            if (!hayOtroPrincipal)
            {
                throw new ConflictException(
                    "No se puede desmarcar el único tarifario principal vigente.");
            }
        }

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrosPrincipalesAsync(entity.Id, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<TarifarioEntity> ApplyOrder(
        IQueryable<TarifarioEntity> query)
    {
        return query
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.Nombre);
    }

    protected override TarifarioEntity MapToNewEntity(
        CreateTarifarioRequest request)
    {
        var entity = TarifarioMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateTarifarioRequest request,
        TarifarioEntity entity)
    {
        TarifarioMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override TarifarioResponse MapToResponse(
        TarifarioEntity entity)
    {
        return TarifarioMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<TarifarioResponse>
        MapToResponseList(IEnumerable<TarifarioEntity> entities)
    {
        return TarifarioMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateTarifarioRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un tarifario con el código '{codigo}'.");
        }

        await EnsureMonedaExistsAsync(request.MonedaId, cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateTarifarioRequest request,
        TarifarioEntity entity,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Id != id &&
                 x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro tarifario con el código '{codigo}'.");
        }

        await EnsureMonedaExistsAsync(request.MonedaId, cancellationToken);
    }

    protected override IQueryable<TarifarioEntity> ApplySearch(
        IQueryable<TarifarioEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            (x.Descripcion != null && x.Descripcion.Contains(search)));
    }

    protected override async Task ValidateDeleteAsync(
        TarifarioEntity entity,
        CancellationToken cancellationToken)
    {
        var tieneDetalles = await DbContext.TarifarioDetalles
            .AnyAsync(x => x.TarifarioId == entity.Id, cancellationToken);

        if (tieneDetalles)
        {
            throw new ConflictException(
                "No se puede eliminar el tarifario porque tiene detalles asociados.");
        }
    }

    private async Task DesmarcarOtrosPrincipalesAsync(
        CancellationToken cancellationToken)
    {
        var otros = await Entities
            .Where(x => x.EsPrincipal)
            .ToListAsync(cancellationToken);

        foreach (var otro in otros)
        {
            otro.EsPrincipal = false;
        }
    }

    private async Task DesmarcarOtrosPrincipalesAsync(
        int excludeId,
        CancellationToken cancellationToken)
    {
        var otros = await Entities
            .Where(x => x.EsPrincipal && x.Id != excludeId)
            .ToListAsync(cancellationToken);

        foreach (var otro in otros)
        {
            otro.EsPrincipal = false;
        }
    }

    private async Task EnsureMonedaExistsAsync(
        int monedaId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Monedas
            .AnyAsync(x => x.Id == monedaId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Moneda), monedaId);
    }

    private static void Normalizar(
        TarifarioEntity entity,
        string codigo,
        string nombre,
        string? descripcion)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.Descripcion = Limpiar(descripcion);
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
