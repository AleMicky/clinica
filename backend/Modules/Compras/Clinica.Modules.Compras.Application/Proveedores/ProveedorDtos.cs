namespace Clinica.Modules.Compras.Application.Proveedores;

public sealed record ProveedorResponse(Guid Id, string Codigo, string Nombre, string? Nit, string? Telefono, string? Email, bool Activo);
public sealed record CreateProveedorRequest(string Codigo, string Nombre, string? Nit = null, string? Telefono = null, string? Email = null, bool Activo = true);
public sealed record UpdateProveedorRequest(string Codigo, string Nombre, string? Nit, string? Telefono, string? Email, bool Activo);
