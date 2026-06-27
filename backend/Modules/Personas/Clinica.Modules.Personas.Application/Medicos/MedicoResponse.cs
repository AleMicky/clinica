namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record MedicoResponse(
    Guid Id,
    Guid EmpleadoId,
    string EmpleadoCodigo,
    string PersonaNombreCompleto,
    Guid EspecialidadId,
    string EspecialidadNombre,
    string MatriculaProfesional,
    string? RegistroColegioMedico
);
