using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Profesiones;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class ProfesionService(RecursosHumanosDbContext context)
    : SimpleCatalogService<Profesion, ProfesionResponse, CreateProfesionRequest, UpdateProfesionRequest>(context),
      IProfesionService
{
    protected override DbSet<Profesion> Set => context.Profesiones;

    protected override string NotFoundMessage => "Profesión no encontrada.";

    protected override Expression<Func<Profesion, ProfesionResponse>> ProjectToResponse =>
        x => new ProfesionResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override ProfesionResponse MapToResponse(Profesion entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateProfesionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateProfesionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);
}
