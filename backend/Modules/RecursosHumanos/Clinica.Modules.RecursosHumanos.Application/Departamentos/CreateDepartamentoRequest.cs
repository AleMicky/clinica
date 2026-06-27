namespace Clinica.Modules.RecursosHumanos.Application.Departamentos;

public sealed record CreateDepartamentoRequest(
    Guid AreaId,
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
