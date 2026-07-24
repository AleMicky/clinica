using System.Linq.Expressions;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Crud;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class CatalogoGrupoService(ParametrosDbContext context)
    : SimpleCatalogService<CatalogoGrupo, CatalogoGrupoResponse, CreateCatalogoGrupoRequest, UpdateCatalogoGrupoRequest>(context),
      ICatalogoGrupoService
{
    protected override DbSet<CatalogoGrupo> Set => context.CatalogoGrupos;

    protected override string NotFoundMessage => "Grupo de catálogo no encontrado.";

    protected override Expression<Func<CatalogoGrupo, CatalogoGrupoResponse>> ProjectToResponse =>
        x => new CatalogoGrupoResponse(x.Id, x.Codigo, x.Nombre, x.Descripcion);

    protected override CatalogoGrupoResponse MapToResponse(CatalogoGrupo entity) =>
        new(entity.Id, entity.Codigo, entity.Nombre, entity.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadCreate(
        CreateCatalogoGrupoRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override (string Codigo, string Nombre, string? Descripcion) ReadUpdate(
        UpdateCatalogoGrupoRequest request) =>
        (request.Codigo, request.Nombre, request.Descripcion);

    protected override void ApplyFields(
        CatalogoGrupo entity,
        string codigo,
        string nombre,
        string? descripcion)
    {
        entity.Codigo = codigo;
        entity.Nombre = nombre;
        entity.Descripcion = descripcion ?? string.Empty;
    }
}
