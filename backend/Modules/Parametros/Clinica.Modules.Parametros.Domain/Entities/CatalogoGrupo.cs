using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class CatalogoGrupo : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;

    public string Nombre { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    private CatalogoGrupo()
    {
    }

    public static CatalogoGrupo Create(string codigo, string nombre, string descripcion)
    {
        return new CatalogoGrupo
        {
            Id = Guid.NewGuid(),
            Codigo = codigo,
            Nombre = nombre,
            Descripcion = descripcion,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string codigo, string nombre, string descripcion)
    {
        Codigo = codigo;
        Nombre = nombre;
        Descripcion = descripcion;
        UpdatedAt = DateTime.UtcNow;
    }
}
