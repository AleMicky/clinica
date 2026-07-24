using System.Linq.Expressions;
using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.TiposAtencion;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class TipoAtencionService(AtencionMedicaDbContext context)
    : SimpleCatalogService<TipoAtencion, TipoAtencionResponse, CreateTipoAtencionRequest, UpdateTipoAtencionRequest>(context),
      ITipoAtencionService
{
    protected override DbSet<TipoAtencion> Set => context.TiposAtencion;

    protected override string NotFoundMessage => "Tipo de atención no encontrado.";

    protected override Expression<Func<TipoAtencion, TipoAtencionResponse>> ProjectToResponse =>
        x => new TipoAtencionResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion ?? string.Empty);

    protected override TipoAtencionResponse MapToResponse(TipoAtencion entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion ?? string.Empty);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateTipoAtencionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateTipoAtencionRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);
}
