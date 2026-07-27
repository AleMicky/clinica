using System.Linq.Expressions;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class LaboratorioExternoService(LaboratorioDbContext context) : ILaboratorioExternoService
{
    private const string NotFoundMessage = "Laboratorio externo no encontrado.";
    private const string DuplicateCodigoMessage = "El código ya existe.";

    public async Task<PagedResult<LaboratorioExternoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await context.LaboratoriosExternos
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<LaboratorioExternoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.LaboratoriosExternos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<LaboratorioExternoResponse> CreateAsync(
        CreateLaboratorioExternoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);

        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new LaboratorioExterno
        {
            Codigo = codigo,
            Nombre = nombre,
            Descripcion = StringNormalize.Optional(request.Descripcion),
            Contacto = StringNormalize.Optional(request.Contacto),
            Telefono = StringNormalize.Optional(request.Telefono),
            Email = StringNormalize.Optional(request.Email),
            Activo = request.Activo,
        };

        context.LaboratoriosExternos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<LaboratorioExternoResponse> UpdateAsync(
        Guid id,
        UpdateLaboratorioExternoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.LaboratoriosExternos.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        var nombre = StringNormalize.Required(request.Nombre);

        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = nombre;
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);
        entity.Contacto = StringNormalize.Optional(request.Contacto);
        entity.Telefono = StringNormalize.Optional(request.Telefono);
        entity.Email = StringNormalize.Optional(request.Email);
        entity.Activo = request.Activo;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.LaboratoriosExternos.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        context.LaboratoriosExternos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static Expression<Func<LaboratorioExterno, LaboratorioExternoResponse>> ProjectToResponse =>
        x => new LaboratorioExternoResponse(
            x.Id,
            x.Codigo,
            x.Nombre,
            x.Descripcion,
            x.Contacto,
            x.Telefono,
            x.Email,
            x.Activo);

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await context.LaboratoriosExternos.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<LaboratorioExterno>(codigo, currentId),
            DuplicateCodigoMessage,
            cancellationToken);
    }
}
