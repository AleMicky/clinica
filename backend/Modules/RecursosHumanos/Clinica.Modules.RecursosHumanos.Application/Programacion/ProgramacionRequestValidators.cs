using Clinica.Modules.RecursosHumanos.Domain.Enums;
using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Programacion;

public class CreateProgramacionRequestValidator : AbstractValidator<CreateProgramacionRequest>
{
    public CreateProgramacionRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.GrupoProgramacionId).NotEmpty();
        RuleFor(x => x.Observacion).MaximumLength(500);
        RuleFor(x => x)
            .Must(x => x.FechaFin >= x.FechaInicio)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.");
    }
}

public class UpdateProgramacionRequestValidator : AbstractValidator<UpdateProgramacionRequest>
{
    public UpdateProgramacionRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.GrupoProgramacionId).NotEmpty();
        RuleFor(x => x.Observacion).MaximumLength(500);
        RuleFor(x => x)
            .Must(x => x.FechaFin >= x.FechaInicio)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.");
    }
}

public class UpdateProgramacionEstadoRequestValidator : AbstractValidator<UpdateProgramacionEstadoRequest>
{
    public UpdateProgramacionEstadoRequestValidator()
    {
        RuleFor(x => x.Estado)
            .IsInEnum()
            .Must(x => x is EstadoProgramacion.Borrador
                or EstadoProgramacion.Publicada
                or EstadoProgramacion.Cerrada
                or EstadoProgramacion.Cancelada);
    }
}
