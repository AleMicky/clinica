namespace Clinica.Modules.RecursosHumanos.Application.Empleados;

public sealed record EmpleadoMedicoEspecialidadResponse(
    Guid EspecialidadId,
    string EspecialidadNombre,
    bool EsPrincipal
);
