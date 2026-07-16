namespace Clinica.Modules.AtencionMedica.Application.FormularioSecciones;

public sealed record CreateFormularioSeccionRequest(
    Guid FormularioClinicoId,
    string Codigo,
    string Nombre,
    int Orden,
    string? EtapaFlujo = null,
    bool Visible = true);
