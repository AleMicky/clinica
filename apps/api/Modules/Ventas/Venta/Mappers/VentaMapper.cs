using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Riok.Mapperly.Abstractions;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;
using VentaDetalleEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaDetalle;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Ventas.Venta.Mappers;

[Mapper]
public static partial class VentaMapper
{
    [MapperIgnoreSource(nameof(VentaEntity.Admision))]
    [MapperIgnoreSource(nameof(VentaEntity.Paciente))]
    [MapperIgnoreSource(nameof(VentaEntity.Moneda))]
    [MapperIgnoreSource(nameof(VentaEntity.Detalles))]
    [MapperIgnoreSource(nameof(VentaEntity.Pagadores))]
    public static partial VentaResponse ToResponse(
        VentaEntity entity
    );

    public static partial List<VentaResponse> ToResponse(
        IEnumerable<VentaEntity> entities
    );

    [MapperIgnoreSource(nameof(CreateVentaRequest.Detalles))]
    [MapperIgnoreSource(nameof(CreateVentaRequest.Pagadores))]
    [MapperIgnoreTarget(nameof(VentaEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaEntity.Numero))]
    [MapperIgnoreTarget(nameof(VentaEntity.Admision))]
    [MapperIgnoreTarget(nameof(VentaEntity.Paciente))]
    [MapperIgnoreTarget(nameof(VentaEntity.Moneda))]
    [MapperIgnoreTarget(nameof(VentaEntity.Detalles))]
    [MapperIgnoreTarget(nameof(VentaEntity.Pagadores))]
    [MapperIgnoreTarget(nameof(VentaEntity.Subtotal))]
    [MapperIgnoreTarget(nameof(VentaEntity.Descuento))]
    [MapperIgnoreTarget(nameof(VentaEntity.Total))]
    [MapperIgnoreTarget(nameof(VentaEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaEntity.ModificadoPor))]
    public static partial VentaEntity ToEntity(
        CreateVentaRequest request
    );

    [MapperIgnoreSource(nameof(UpdateVentaRequest.Detalles))]
    [MapperIgnoreSource(nameof(UpdateVentaRequest.Pagadores))]
    [MapperIgnoreTarget(nameof(VentaEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaEntity.Numero))]
    [MapperIgnoreTarget(nameof(VentaEntity.Admision))]
    [MapperIgnoreTarget(nameof(VentaEntity.Paciente))]
    [MapperIgnoreTarget(nameof(VentaEntity.Moneda))]
    [MapperIgnoreTarget(nameof(VentaEntity.Detalles))]
    [MapperIgnoreTarget(nameof(VentaEntity.Pagadores))]
    [MapperIgnoreTarget(nameof(VentaEntity.Subtotal))]
    [MapperIgnoreTarget(nameof(VentaEntity.Descuento))]
    [MapperIgnoreTarget(nameof(VentaEntity.Total))]
    [MapperIgnoreTarget(nameof(VentaEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateVentaRequest request,
        VentaEntity entity
    );
}
[Mapper]
public static partial class VentaDetalleMapper
{
    public static VentaDetalleResponse ToResponse(
        VentaDetalleEntity entity)
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
[Mapper]
public static partial class VentaPagadorMapper
{
    [MapperIgnoreSource(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreSource(nameof(VentaPagadorEntity.Convenio))]
    public static partial VentaPagadorResponse ToResponse(
        VentaPagadorEntity entity
    );

    public static partial List<VentaPagadorResponse> ToResponse(
        IEnumerable<VentaPagadorEntity> entities
    );

    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Convenio))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.ModificadoPor))]
    public static partial VentaPagadorEntity ToEntity(
        CreateVentaPagadorRequest request
    );

    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Convenio))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateVentaPagadorRequest request,
        VentaPagadorEntity entity
    );
}