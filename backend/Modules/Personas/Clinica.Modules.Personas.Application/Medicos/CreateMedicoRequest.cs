namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record CreateMedicoRequest(
    Guid EmpleadoId,
    IReadOnlyList<Guid> EspecialidadIds,
    Guid EspecialidadPrincipalId,
    string MatriculaProfesional,
    string? RegistroColegioMedico = null
);
