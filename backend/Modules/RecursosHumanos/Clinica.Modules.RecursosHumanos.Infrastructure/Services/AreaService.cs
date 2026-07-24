using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Areas;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class AreaService(RecursosHumanosDbContext context)
    : SimpleCatalogService<Area, AreaResponse, CreateAreaRequest, UpdateAreaRequest>(context),
      IAreaService
{
    protected override DbSet<Area> Set => context.Areas;

    protected override string NotFoundMessage => "Área no encontrada.";

    protected override Expression<Func<Area, AreaResponse>> ProjectToResponse =>
        x => new AreaResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override AreaResponse MapToResponse(Area entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateAreaRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);
}
