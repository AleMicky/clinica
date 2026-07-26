namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public sealed record AreaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    Guid TipoAreaId,
    string TipoAreaNombre,
    Guid? AreaPadreId,
    string? AreaPadreNombre,
    Guid? ResponsableEmpleadoId
);
