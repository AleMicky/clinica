namespace Clinica.SharedKernel.Abstractions;

/// <summary>
/// Entidad de catálogo con código único (y opcionalmente nombre/descripción).
/// </summary>
public interface ICodedEntity
{
    Guid Id { get; set; }
    string Codigo { get; set; }
}
