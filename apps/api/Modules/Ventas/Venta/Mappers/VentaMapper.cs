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
    [MapperIgnoreSource(nameof(VentaDetalleEntity.Venta))]
    [MapperIgnoreSource(nameof(VentaDetalleEntity.Servicio))]
    [MapperIgnoreSource(nameof(VentaDetalleEntity.Medico))]
    public static partial VentaDetalleResponse ToResponse(
        VentaDetalleEntity entity
    );

    public static partial List<VentaDetalleResponse> ToResponse(
        IEnumerable<VentaDetalleEntity> entities
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
