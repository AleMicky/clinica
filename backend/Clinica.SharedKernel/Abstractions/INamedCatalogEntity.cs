namespace Clinica.SharedKernel.Abstractions;

/// <summary>
/// Catálogo simple: Código, Nombre y Descripción opcional.
/// </summary>
public interface INamedCatalogEntity : ICodedEntity
{
    string Nombre { get; set; }
    string? Descripcion { get; set; }
}
