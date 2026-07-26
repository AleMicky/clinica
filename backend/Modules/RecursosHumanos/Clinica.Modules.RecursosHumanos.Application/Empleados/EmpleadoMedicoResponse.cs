namespace Clinica.Modules.RecursosHumanos.Application.Empleados;

public sealed record EmpleadoMedicoResponse(
    Guid Id,
    IReadOnlyList<EmpleadoMedicoEspecialidadResponse> Especialidades,
    Guid EspecialidadPrincipalId,
    string MatriculaProfesional,
    string? RegistroColegioMedico
);
