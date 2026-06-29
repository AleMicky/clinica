namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record MedicoResponse(
    Guid Id,
    Guid EmpleadoId,
    string EmpleadoCodigo,
    string PersonaNombreCompleto,
    IReadOnlyList<MedicoEspecialidadResponse> Especialidades,
    Guid EspecialidadPrincipalId,
    string EspecialidadPrincipalNombre,
    string MatriculaProfesional,
    string? RegistroColegioMedico
);
