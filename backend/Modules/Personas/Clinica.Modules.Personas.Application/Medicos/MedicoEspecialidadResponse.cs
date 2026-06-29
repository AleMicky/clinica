namespace Clinica.Modules.Personas.Application.Medicos;

public sealed record MedicoEspecialidadResponse(
    Guid EspecialidadId,
    string EspecialidadNombre,
    bool EsPrincipal
);
