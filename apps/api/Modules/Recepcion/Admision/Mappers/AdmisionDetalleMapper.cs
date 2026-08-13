using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using Riok.Mapperly.Abstractions;

using MedicoEntity = Clinica.Api.Modules.RecursosHumanos.Medico.Entity.Medico;
using ServicioEntity = Clinica.Api.Modules.Servicios.Servicios.Entity.Servicio;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;

namespace Clinica.Api.Modules.Recepcion.Admision.Mappers;

[Mapper]
public static partial class AdmisionDetalleMapper
{
    [MapperIgnoreSource(nameof(AdmisionDetalle.Admision))]
    [MapperIgnoreSource(nameof(AdmisionDetalle.ServicioId))]
    [MapperIgnoreSource(nameof(AdmisionDetalle.MedicoId))]
    public static partial AdmisionDetalleResponse ToResponse(
        AdmisionDetalle entity
    );

    public static partial List<AdmisionDetalleResponse> ToResponse(
        IEnumerable<AdmisionDetalle> entities
    );

    [MapperIgnoreSource(nameof(ServicioEntity.Descripcion))]
    [MapperIgnoreSource(nameof(ServicioEntity.CategoriaServicioId))]
    [MapperIgnoreSource(nameof(ServicioEntity.CategoriaServicio))]
    [MapperIgnoreSource(nameof(ServicioEntity.Tarifas))]
    [MapperIgnoreSource(nameof(ServicioEntity.Activo))]
    [MapperIgnoreSource(nameof(ServicioEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(ServicioEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(ServicioEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(ServicioEntity.ModificadoPor))]
    private static partial ServicioInfo ToServicioInfo(
        ServicioEntity entity
    );

    [MapperIgnoreSource(nameof(MedicoEntity.EmpleadoId))]
    [MapperIgnoreSource(nameof(MedicoEntity.RegistroMinisterioSalud))]
    [MapperIgnoreSource(nameof(MedicoEntity.Especialidades))]
    [MapperIgnoreSource(nameof(MedicoEntity.Activo))]
    [MapperIgnoreSource(nameof(MedicoEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(MedicoEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(MedicoEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(MedicoEntity.ModificadoPor))]
    private static partial MedicoInfo ToMedicoInfo(
        MedicoEntity entity
    );

    private static EmpleadoInfo ToEmpleadoInfo(
        EmpleadoEntity entity)
    {
        return new EmpleadoInfo
        {
            Id = entity.Id,
            CodigoEmpleado = entity.CodigoEmpleado,
            NombreCompleto = string.Join(
                " ",
                new[]
                    {
                        entity.Persona.Nombres,
                        entity.Persona.ApellidoPaterno,
                        entity.Persona.ApellidoMaterno
                    }
                    .Where(x => !string.IsNullOrWhiteSpace(x)))
        };
    }

    [MapperIgnoreTarget(nameof(AdmisionDetalle.Id))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.AdmisionId))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Admision))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Servicio))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Medico))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Total))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.ModificadoPor))]
    public static partial AdmisionDetalle ToEntity(
        CreateAdmisionDetalleRequest request
    );

    [MapperIgnoreTarget(nameof(AdmisionDetalle.Id))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.AdmisionId))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Admision))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Servicio))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Medico))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Total))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionDetalle.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateAdmisionDetalleRequest request,
        AdmisionDetalle entity
    );
}
