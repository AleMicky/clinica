namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record UpdateMedicoRequest(
    Guid EmpleadoId,
    IReadOnlyList<Guid> EspecialidadIds,
    Guid EspecialidadPrincipalId,
    string MatriculaProfesional,
    string? RegistroColegioMedico = null
);
