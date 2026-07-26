namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public sealed record CreateAreaRequest(
    string Codigo,
    string Nombre,
    Guid TipoAreaId,
    string Descripcion = "",
    Guid? AreaPadreId = null,
    Guid? ResponsableEmpleadoId = null
);
