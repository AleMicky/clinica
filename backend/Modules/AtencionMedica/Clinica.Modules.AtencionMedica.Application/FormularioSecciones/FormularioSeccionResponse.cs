namespace Clinica.Modules.AtencionMedica.Application.FormularioSecciones;

public sealed record FormularioSeccionResponse(
    Guid Id,
    Guid FormularioClinicoId,
    string Codigo,
    string Nombre,
    int Orden);
