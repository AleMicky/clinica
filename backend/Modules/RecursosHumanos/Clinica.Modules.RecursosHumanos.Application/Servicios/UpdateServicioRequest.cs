namespace Clinica.Modules.RecursosHumanos.Application.Servicios;

public sealed record UpdateServicioRequest(
    Guid DepartamentoId,
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
