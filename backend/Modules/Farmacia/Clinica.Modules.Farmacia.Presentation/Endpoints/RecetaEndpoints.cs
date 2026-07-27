using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Recetas;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Farmacia.Presentation.Endpoints;

public static class RecetaEndpoints
{
    public static RouteGroupBuilder MapRecetaEndpoints(this RouteGroupBuilder group)
    {
        var recetas = group.MapGroup("/recetas")
            .RequireAuthorization()
            .WithTags(FarmaciaSwaggerTags.Recetas);

        recetas.MapGet("/", async ([AsParameters] RecetaPagedRequest request, IRecetaService service, CancellationToken ct) =>
            ApiResults.Ok(await service.GetPagedAsync(request, ct)))
            .WithName("FarmaciaReceta_GetPaged");

        recetas.MapGet("/{id:guid}", async (Guid id, IRecetaService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result is null ? ApiResults.NotFound("Receta no encontrada.") : ApiResults.Ok(result);
        }).WithName("FarmaciaReceta_GetById");

        recetas.MapPost("/", async (
                CreateRecetaRequest request,
                IValidator<CreateRecetaRequest> validator,
                IRecetaService service,
                CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
            return ApiResults.Created(await service.CreateAsync(request, ct));
        }).WithName("FarmaciaReceta_Create");

        recetas.MapPost("/{id:guid}/anular", async (Guid id, IRecetaService service, CancellationToken ct) =>
        {
            await service.AnularAsync(id, ct);
            return ApiResults.Ok("Receta anulada.");
        }).WithName("FarmaciaReceta_Anular");

        return recetas;
    }
}
