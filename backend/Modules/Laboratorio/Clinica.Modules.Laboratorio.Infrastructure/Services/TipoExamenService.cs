using System.Linq.Expressions;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.TiposExamen;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class TipoExamenService(LaboratorioDbContext context)
    : SimpleCatalogService<TipoExamen, TipoExamenResponse, CreateTipoExamenRequest, UpdateTipoExamenRequest>(context),
      ITipoExamenService
{
    protected override DbSet<TipoExamen> Set => context.TiposExamen;

    protected override string NotFoundMessage => "Tipo de examen no encontrado.";

    protected override Expression<Func<TipoExamen, TipoExamenResponse>> ProjectToResponse =>
        x => new TipoExamenResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override TipoExamenResponse MapToResponse(TipoExamen entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateTipoExamenRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateTipoExamenRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);
}
