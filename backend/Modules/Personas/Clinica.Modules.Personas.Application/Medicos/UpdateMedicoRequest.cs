namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record UpdateMedicoRequest(
    Guid EmpleadoId,
    Guid EspecialidadId,
    string MatriculaProfesional,
    string? RegistroColegioMedico = null
);
