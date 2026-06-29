namespace Clinica.Modules.Personas.Application.Empleados;

public sealed record EmpleadoMedicoRequest(
    IReadOnlyList<Guid> EspecialidadIds,
    Guid EspecialidadPrincipalId,
    string MatriculaProfesional,
    string? RegistroColegioMedico = null
);
