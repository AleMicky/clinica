namespace Clinica.Api.Shared.Configuration;

public sealed class ClinicaOptions
{
    public const string SectionName = "Clinica";

    public string Nombre { get; init; } = "Clínica";
    public string Direccion { get; init; } = string.Empty;
    public string Telefono { get; init; } = string.Empty;
    public string Nit { get; init; } = string.Empty;
}