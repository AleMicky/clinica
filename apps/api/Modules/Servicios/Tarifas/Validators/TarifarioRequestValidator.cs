using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.Tarifas.Validators;

public abstract class TarifarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : TarifarioRequest
{
    protected TarifarioRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(10)
            .WithMessage("El código no puede superar los 10 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));

        RuleFor(x => x.FechaInicio)
            .NotEmpty()
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.")
            .When(x => x.FechaFin.HasValue);

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");
    }
}

public sealed class CreateTarifarioRequestValidator
    : TarifarioRequestValidator<CreateTarifarioRequest>;

public sealed class UpdateTarifarioRequestValidator
    : TarifarioRequestValidator<UpdateTarifarioRequest>;
