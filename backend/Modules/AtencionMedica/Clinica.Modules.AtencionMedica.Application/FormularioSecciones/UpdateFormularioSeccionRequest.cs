namespace Clinica.Modules.AtencionMedica.Application.FormularioSecciones;

public sealed record UpdateFormularioSeccionRequest(
    Guid FormularioClinicoId,
    string Codigo,
    string Nombre,
    int Orden);
