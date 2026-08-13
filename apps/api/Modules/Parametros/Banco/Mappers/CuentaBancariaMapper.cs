using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Mappers;

[Mapper]
public static partial class CuentaBancariaMapper
{
    public static partial CuentaBancariaResponse ToResponse(
        Entity.CuentaBancaria entity
    );

    public static partial List<CuentaBancariaResponse> ToResponse(
        IEnumerable<Entity.CuentaBancaria> entities
    );

    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Id))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.BancoId))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Activo))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.ModificadoPor))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Banco))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Moneda))]
    public static partial Entity.CuentaBancaria ToEntity(
        CreateCuentaBancariaRequest request
    );

    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Id))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.BancoId))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Activo))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.ModificadoPor))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Banco))]
    [MapperIgnoreTarget(nameof(Entity.CuentaBancaria.Moneda))]
    public static partial void UpdateEntity(
        UpdateCuentaBancariaRequest request,
        Entity.CuentaBancaria entity
    );
}
