using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Mappers;

[Mapper]
public static partial class BancoMapper
{
    public static partial BancoResponse ToResponse(
        Entity.Banco entity
    );

    public static partial List<BancoResponse> ToResponse(
        IEnumerable<Entity.Banco> entities
    );

    [MapperIgnoreTarget(nameof(Entity.Banco.Id))]
    [MapperIgnoreTarget(nameof(Entity.Banco.Activo))]
    [MapperIgnoreTarget(nameof(Entity.Banco.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.Banco.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.Banco.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.Banco.ModificadoPor))]
    [MapperIgnoreTarget(nameof(Entity.Banco.Cuentas))]
    public static partial Entity.Banco ToEntity(
        CreateBancoRequest request
    );

    [MapperIgnoreTarget(nameof(Entity.Banco.Id))]
    [MapperIgnoreTarget(nameof(Entity.Banco.Activo))]
    [MapperIgnoreTarget(nameof(Entity.Banco.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.Banco.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.Banco.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.Banco.ModificadoPor))]
    [MapperIgnoreTarget(nameof(Entity.Banco.Cuentas))]
    public static partial void UpdateEntity(
        UpdateBancoRequest request,
        Entity.Banco entity
    );
}
