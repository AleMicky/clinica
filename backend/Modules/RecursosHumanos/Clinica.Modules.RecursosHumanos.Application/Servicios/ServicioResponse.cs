namespace Clinica.Modules.RecursosHumanos.Application.Servicios;

public sealed record ServicioResponse(
    Guid Id,
    Guid DepartamentoId,
    string DepartamentoNombre,
    string Codigo,
    string Nombre,
    string Descripcion
);
