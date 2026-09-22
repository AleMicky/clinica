using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Mappers;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Excel;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using CargoEntity = Clinica.Api.Modules.RecursosHumanos.Cargo.Entity.Cargo;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Services;

public sealed class CargoService(
    AppDbContext dbContext,
    IExcelReportGenerator excelReportGenerator,
    ICurrentUserService currentUserService
) : CrudService<
        CargoEntity,
        CreateCargoRequest,
        UpdateCargoRequest,
        CargoResponse
    >(dbContext)
{
    protected override IQueryable<CargoEntity> ApplyOrder(
        IQueryable<CargoEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override CargoEntity MapToNewEntity(
        CreateCargoRequest request)
    {
        var entity = CargoMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateCargoRequest request,
        CargoEntity entity)
    {
        CargoMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    protected override CargoResponse MapToResponse(
        CargoEntity entity)
    {
        return CargoMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<CargoResponse>
        MapToResponseList(IEnumerable<CargoEntity> entities)
    {
        return CargoMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateCargoRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un cargo con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateCargoRequest request,
        CargoEntity entity,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Id != id && x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro cargo con el código '{codigo}'.");
        }
    }

    protected override IQueryable<CargoEntity> ApplySearch(
        IQueryable<CargoEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            (x.Descripcion != null && x.Descripcion.Contains(search)));
    }

    public async Task<byte[]> ExportarExcelAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Cargos
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(term) ||
                x.Nombre.Contains(term) ||
                (x.Descripcion != null && x.Descripcion.Contains(term)));
        }

        var cargos = await query
            .OrderBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        var options = new ExcelReportOptions
        {
            Title = "Catálogo Oficial de Cargos",
            Subtitle = string.IsNullOrWhiteSpace(search)
                ? "Recursos Humanos - Cargos y Puestos Laborales"
                : $"Recursos Humanos - Filtro de búsqueda: \"{search}\"",
            SheetName = "Cargos",
            HeaderColor = "#2563EB",
            GeneratedBy = currentUserService.UserId?.ToString()
        };

        return excelReportGenerator.Generate(options, cargos, builder =>
        {
            builder.AddColumn("Código", x => x.Codigo, ExcelColumnAlignment.Center);
            builder.AddColumn("Nombre", x => x.Nombre);
            builder.AddColumn("Descripción", x => x.Descripcion ?? string.Empty);
            builder.AddBooleanColumn("Estado", x => x.Activo, trueText: "Activo", falseText: "Inactivo");
            builder.AddDateColumn("Fecha Creación", x => x.FechaCreacion);
        });
    }

    private static void Normalizar(
        CargoEntity entity,
        CargoRequest request)
    {
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = NormalizarOpcional(request.Descripcion);
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}