using System.Linq.Expressions;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Especialidades;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class EspecialidadService(RecursosHumanosDbContext context)
    : SimpleCatalogService<Especialidad, EspecialidadResponse, CreateEspecialidadRequest, UpdateEspecialidadRequest>(context),
      IEspecialidadService
{
    protected override DbSet<Especialidad> Set => context.Especialidades;

    protected override string NotFoundMessage => "Especialidad no encontrada.";

    protected override Expression<Func<Especialidad, EspecialidadResponse>> ProjectToResponse =>
        x => new EspecialidadResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override EspecialidadResponse MapToResponse(Especialidad entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateEspecialidadRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateEspecialidadRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override async Task OnBeforeDeleteAsync(
        Especialidad entity,
        CancellationToken cancellationToken)
    {
        var enUso = await context.Set<Clinica.Modules.Personas.Domain.Entities.MedicoEspecialidad>()
            .AnyAsync(x => x.EspecialidadId == entity.Id, cancellationToken);

        if (enUso)
            throw new BusinessException(
                "No se puede eliminar la especialidad porque está asignada a uno o más médicos.");
    }
}
