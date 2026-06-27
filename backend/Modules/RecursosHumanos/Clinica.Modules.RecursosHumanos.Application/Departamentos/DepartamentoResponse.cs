namespace Clinica.Modules.RecursosHumanos.Application.Departamentos;

public sealed record DepartamentoResponse(
    Guid Id,
    Guid AreaId,
    string AreaNombre,
    string Codigo,
    string Nombre,
    string Descripcion
);
