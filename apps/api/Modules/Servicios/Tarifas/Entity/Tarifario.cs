using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Tarifas.Entity;

public sealed class Tarifario : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;

    public bool EsPrincipal { get; set; }

    public ICollection<TarifarioDetalle> Detalles { get; set; } = [];
    public ICollection<ConvenioTarifario> Convenios { get; set; } = [];
 }