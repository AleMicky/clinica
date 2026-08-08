using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Parametros.Catalogo.Validators;

public abstract class CatalogoGrupoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CatalogoGrupoRequest
{
    protected CatalogoGrupoRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El código no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.");
    }
}

public sealed class CreateCatalogoGrupoRequestValidator
    : CatalogoGrupoRequestValidator<CreateCatalogoGrupoRequest>;

public sealed class UpdateCatalogoGrupoRequestValidator
    : CatalogoGrupoRequestValidator<UpdateCatalogoGrupoRequest>;
