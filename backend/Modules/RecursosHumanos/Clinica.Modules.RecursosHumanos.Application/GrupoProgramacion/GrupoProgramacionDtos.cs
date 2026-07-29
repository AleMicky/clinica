namespace Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;

public sealed record CreateGrupoProgramacionRequest(
    string Codigo,
    string Nombre,
    string? Descripcion,
    Guid AreaId);

public sealed record UpdateGrupoProgramacionRequest(
    string Codigo,
    string Nombre,
    string? Descripcion,
    Guid AreaId);

public sealed record SetGrupoProgramacionEmpleadosRequest(
    IReadOnlyList<Guid> EmpleadoIds);

public sealed record GrupoProgramacionEmpleadoResponse(
    Guid Id,
    Guid EmpleadoId,
    string EmpleadoCodigo,
    string EmpleadoNombre);

public sealed record GrupoProgramacionResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    Guid AreaId,
    string AreaCodigo,
    string AreaNombre,
    IReadOnlyList<GrupoProgramacionEmpleadoResponse> Empleados);
