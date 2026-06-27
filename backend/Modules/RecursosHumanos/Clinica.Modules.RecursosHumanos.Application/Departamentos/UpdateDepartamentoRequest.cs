namespace Clinica.Modules.RecursosHumanos.Application.Departamentos;

public sealed record UpdateDepartamentoRequest(
    Guid AreaId,
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
