using Clinica.Modules.Personas.Application.Medicos;

namespace Clinica.Modules.Personas.Application.Empleados;

public sealed record EmpleadoMedicoResponse(
    Guid Id,
    IReadOnlyList<MedicoEspecialidadResponse> Especialidades,
    Guid EspecialidadPrincipalId,
    string MatriculaProfesional,
    string? RegistroColegioMedico
);
