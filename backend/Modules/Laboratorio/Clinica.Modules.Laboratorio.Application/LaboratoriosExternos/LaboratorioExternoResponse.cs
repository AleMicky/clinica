namespace Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;

public sealed record LaboratorioExternoResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    string? Contacto,
    string? Telefono,
    string? Email,
    bool Activo
);
