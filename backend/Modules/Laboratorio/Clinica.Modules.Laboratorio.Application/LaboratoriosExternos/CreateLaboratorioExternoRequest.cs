namespace Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;

public sealed record CreateLaboratorioExternoRequest(
    string Codigo,
    string Nombre,
    string? Descripcion = null,
    string? Contacto = null,
    string? Telefono = null,
    string? Email = null,
    bool Activo = true
);
