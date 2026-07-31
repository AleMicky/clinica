using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Inventarios;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class InventarioFisicoEndpoints
{
    public static RouteGroupBuilder MapInventarioFisicoEndpoints(this RouteGroupBuilder group)
    {
        var inventarios = group.MapGroup("/inventarios-fisicos")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Inventarios);

        inventarios.MapGet("/", async (
                [AsParameters] InventarioPagedRequest request,
                IInventarioFisicoService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("AlmacenInventario_GetPaged");

        inventarios.MapGet("/{id:guid}", async (
                Guid id,
                IInventarioFisicoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null ? ApiResults.NotFound("Inventario no encontrado.") : ApiResults.Ok(result);
            })
            .WithName("AlmacenInventario_GetById");

        inventarios.MapPost("/", async (
                CreateInventarioFisicoRequest request,
                IValidator<CreateInventarioFisicoRequest> validator,
                IInventarioFisicoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Created(await service.CreateAsync(request, cancellationToken), "Inventario creado.");
            })
            .WithName("AlmacenInventario_Create");

        inventarios.MapPost("/{id:guid}/iniciar-conteo", async (Guid id, IInventarioFisicoService service, CancellationToken ct) =>
            ApiResults.Ok(await service.IniciarConteoAsync(id, ct), "Conteo iniciado."))
            .WithName("AlmacenInventario_IniciarConteo");

        inventarios.MapPost("/{id:guid}/contar", async (
                Guid id,
                ContarInventarioRequest request,
                IValidator<ContarInventarioRequest> validator,
                IInventarioFisicoService service,
                CancellationToken ct) =>
            {
                var validation = await validator.ValidateAsync(request, ct);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Ok(await service.ContarAsync(id, request, ct), "Conteo actualizado.");
            })
            .WithName("AlmacenInventario_Contar");

        inventarios.MapPost("/{id:guid}/finalizar-conteo", async (Guid id, IInventarioFisicoService service, CancellationToken ct) =>
            ApiResults.Ok(await service.FinalizarConteoAsync(id, ct), "Conteo finalizado."))
            .WithName("AlmacenInventario_FinalizarConteo");

        inventarios.MapPost("/{id:guid}/aprobar", async (Guid id, IInventarioFisicoService service, CancellationToken ct) =>
            ApiResults.Ok(await service.AprobarAsync(id, ct), "Inventario aprobado."))
            .WithName("AlmacenInventario_Aprobar");

        inventarios.MapPost("/{id:guid}/anular", async (Guid id, IInventarioFisicoService service, CancellationToken ct) =>
            ApiResults.Ok(await service.AnularAsync(id, ct), "Inventario anulado."))
            .WithName("AlmacenInventario_Anular");

        return inventarios;
    }
}
