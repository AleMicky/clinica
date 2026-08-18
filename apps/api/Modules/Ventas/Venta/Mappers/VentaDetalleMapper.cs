using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Riok.Mapperly.Abstractions;
using VentaDetalleEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaDetalle;

namespace Clinica.Api.Modules.Ventas.Venta.Mappers;

[Mapper]
public static partial class VentaDetalleMapper
{
    public static VentaDetalleResponse ToResponse(VentaDetalleEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);

        return new VentaDetalleResponse
        {
            Id = entity.Id,
            VentaId = entity.VentaId,

            Servicio = entity.Servicio is null
                ? null
                : new ServiceInfo
                {
                    Id = entity.Servicio.Id,
                    Codigo = entity.Servicio.Codigo,
                    Nombre = entity.Servicio.Nombre
                },

            Medico = entity.Medico is null
                ? null
                : new MedicoInfo
                {
                    Id = entity.Medico.Id,
                    NombreMedico = ObtenerNombreMedico(entity.Medico)
                },

            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Descuento = entity.Descuento,
            Total = entity.Total,
            MontoMedico = entity.MontoMedico,
            MontoClinica = entity.MontoClinica,

            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    public static List<VentaDetalleResponse> ToResponse(
        IEnumerable<VentaDetalleEntity> entities)
    {
        return entities
            .Where(x => x is not null)
            .Select(ToResponse)
            .ToList();
    }

    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Medico))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Total))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.MontoMedico))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.MontoClinica))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.ModificadoPor))]
    public static partial VentaDetalleEntity ToEntity(
        CreateVentaDetalleRequest request
    );

    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Medico))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Total))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.MontoMedico))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.MontoClinica))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaDetalleEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateVentaDetalleRequest request,
        VentaDetalleEntity entity
    );

    private static string ObtenerNombreMedico(
        Medico medico)
    {
        var persona = medico.Empleado?.Persona;

        if (persona is null)
            return string.Empty;

        return string.Join(
            " ",
            new[]
                {
                    persona.Nombres,
                    persona.ApellidoPaterno,
                    persona.ApellidoMaterno
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
        );
    }
}