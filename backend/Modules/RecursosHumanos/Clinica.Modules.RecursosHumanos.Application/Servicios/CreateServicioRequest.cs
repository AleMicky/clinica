namespace Clinica.Modules.RecursosHumanos.Application.Servicios;

public sealed record CreateServicioRequest(
    Guid DepartamentoId,
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
