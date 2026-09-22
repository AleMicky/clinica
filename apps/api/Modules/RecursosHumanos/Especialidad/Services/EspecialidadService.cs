using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Mappers;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Excel;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;

public sealed class EspecialidadService(
    AppDbContext dbContext,
    IExcelReportGenerator excelReportGenerator,
    ICurrentUserService currentUserService
) : CrudService<
        EspecialidadEntity,
        CreateEspecialidadRequest,
        UpdateEspecialidadRequest,
        EspecialidadResponse
    >(dbContext)
{
    protected override IQueryable<EspecialidadEntity> ApplyOrder(
        IQueryable<EspecialidadEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override EspecialidadEntity MapToNewEntity(CreateEspecialidadRequest request)
    {
        var entity = EspecialidadMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateEspecialidadRequest request, EspecialidadEntity entity)
    {
        EspecialidadMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override EspecialidadResponse MapToResponse(EspecialidadEntity entity)
    {
        return EspecialidadMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<EspecialidadResponse> MapToResponseList(
        IEnumerable<EspecialidadEntity> entities)
    {
        return EspecialidadMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateEspecialidadRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una especialidad con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateEspecialidadRequest request,
        EspecialidadEntity entity,
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
                $"Ya existe otra especialidad con el código '{codigo}'.");
        }
    }

    protected override IQueryable<EspecialidadEntity> ApplySearch(
        IQueryable<EspecialidadEntity> query,
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
        var query = dbContext.Especialidades
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(term) ||
                x.Nombre.Contains(term) ||
                (x.Descripcion != null && x.Descripcion.Contains(term)));
        }

        var especialidades = await query
            .OrderBy(x => x.Nombre)
            .ToListAsync(cancellationToken);

        var options = new ExcelReportOptions
        {
            Title = "Catálogo Oficial de Especialidades Médicas",
            Subtitle = string.IsNullOrWhiteSpace(search)
                ? "Recursos Humanos - Especialidades y Subespecialidades"
                : $"Recursos Humanos - Filtro de búsqueda: \"{search}\"",
            SheetName = "Especialidades",
            HeaderColor = "#2563EB",
            GeneratedBy = currentUserService.UserId?.ToString()
        };

        return excelReportGenerator.Generate(options, especialidades, builder =>
        {
            builder.AddColumn("Código", x => x.Codigo, ExcelColumnAlignment.Center);
            builder.AddColumn("Nombre", x => x.Nombre);
            builder.AddColumn("Descripción", x => x.Descripcion ?? string.Empty);
            builder.AddBooleanColumn("Estado", x => x.Activo, trueText: "Activo", falseText: "Inactivo");
            builder.AddDateColumn("Fecha Creación", x => x.FechaCreacion);
        });
    }

    private static void Normalizar(
        EspecialidadEntity entity,
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
