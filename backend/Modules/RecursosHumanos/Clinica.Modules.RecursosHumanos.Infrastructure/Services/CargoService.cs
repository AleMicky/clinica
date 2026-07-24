using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Cargos;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class CargoService(RecursosHumanosDbContext context)
    : SimpleCatalogService<Cargo, CargoResponse, CreateCargoRequest, UpdateCargoRequest>(context),
      ICargoService
{
    protected override DbSet<Cargo> Set => context.Cargos;

    protected override string NotFoundMessage => "Cargo no encontrado.";

    protected override Expression<Func<Cargo, CargoResponse>> ProjectToResponse =>
        x => new CargoResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override CargoResponse MapToResponse(Cargo entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateCargoRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateCargoRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);
}
