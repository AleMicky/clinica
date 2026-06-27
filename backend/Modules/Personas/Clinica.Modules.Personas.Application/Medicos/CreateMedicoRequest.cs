namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record CreateMedicoRequest(
    Guid EmpleadoId,
    Guid EspecialidadId,
    string MatriculaProfesional,
    string? RegistroColegioMedico = null
);
