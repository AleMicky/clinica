using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Riok.Mapperly.Abstractions;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;

namespace Clinica.Api.Modules.Ventas.Venta.Mappers;

[Mapper]
public static partial class VentaMapper
{
    [MapperIgnoreSource(nameof(VentaEntity.Admision))]
    [MapperIgnoreSource(nameof(VentaEntity.PacienteId))]
    [MapperIgnoreSource(nameof(VentaEntity.VendedorId))]
    [MapperIgnoreSource(nameof(VentaEntity.MonedaId))]
    public static partial VentaResponse ToResponse(
        VentaEntity entity
    );

    public static partial List<VentaResponse> ToResponse(
        IEnumerable<VentaEntity> entities
    );

    [MapProperty(
        nameof(Paciente.Persona),
        nameof(PacienteBaseInfo.NombreCompleto),
        Use = nameof(MapNombreCompleto)
    )]
    [MapperIgnoreSource(nameof(Paciente.PersonaId))]
    [MapperIgnoreSource(nameof(Paciente.Activo))]
    [MapperIgnoreSource(nameof(Paciente.FechaCreacion))]
    [MapperIgnoreSource(nameof(Paciente.FechaModificacion))]
    [MapperIgnoreSource(nameof(Paciente.CreadoPor))]
    [MapperIgnoreSource(nameof(Paciente.ModificadoPor))]
    private static partial PacienteBaseInfo ToPacienteBaseInfo(
        Paciente entity
    );

    [MapperIgnoreSource(nameof(Empleado.PersonaId))]
    [MapperIgnoreSource(nameof(Empleado.FechaIngreso))]
    [MapperIgnoreSource(nameof(Empleado.FechaRetiro))]
    [MapperIgnoreSource(nameof(Empleado.Asignaciones))]
    [MapperIgnoreSource(nameof(Empleado.FechaCreacion))]
    [MapperIgnoreSource(nameof(Empleado.FechaModificacion))]
    [MapperIgnoreSource(nameof(Empleado.CreadoPor))]
    [MapperIgnoreSource(nameof(Empleado.ModificadoPor))]
    [MapperIgnoreSource(nameof(Empleado.Activo))]
    [MapProperty(
        nameof(Empleado.Persona),
        nameof(EmpleadoBaseInfo.NombreCompleto),
        Use = nameof(MapNombreCompleto)
    )]
    private static partial EmpleadoBaseInfo ToEmpleadoBaseInfo(
        Empleado entity
    );

    [MapperIgnoreSource(nameof(Moneda.Simbolo))]
    [MapperIgnoreSource(nameof(Moneda.Decimales))]
    [MapperIgnoreSource(nameof(Moneda.EsBase))]
    [MapperIgnoreSource(nameof(Moneda.Activo))]
    [MapperIgnoreSource(nameof(Moneda.FechaCreacion))]
    [MapperIgnoreSource(nameof(Moneda.FechaModificacion))]
    [MapperIgnoreSource(nameof(Moneda.CreadoPor))]
    [MapperIgnoreSource(nameof(Moneda.ModificadoPor))]
    private static partial MonedaInfo ToMonedaInfo(
        Moneda entity
    );


    [MapperIgnoreSource(nameof(VentaDetalle.Venta))]
    [MapperIgnoreSource(nameof(VentaDetalle.ServicioId))]
    [MapperIgnoreSource(nameof(VentaDetalle.MedicoId))]
    private static partial VentaDetalleResponse ToVentaDetalleResponse(
        VentaDetalle entity
    );

    [MapProperty(
        $"{nameof(Medico.Empleado)}.{nameof(Empleado.Persona)}",
        nameof(MedicoInfo.NombreMedico),
        Use = nameof(MapNombreCompleto)
    )]
    [MapperIgnoreSource(nameof(Medico.EmpleadoId))]
    [MapperIgnoreSource(nameof(Medico.MatriculaProfesional))]
    [MapperIgnoreSource(nameof(Medico.RegistroMinisterioSalud))]
    [MapperIgnoreSource(nameof(Medico.Especialidades))]
    [MapperIgnoreSource(nameof(Medico.Activo))]
    [MapperIgnoreSource(nameof(Medico.FechaCreacion))]
    [MapperIgnoreSource(nameof(Medico.FechaModificacion))]
    [MapperIgnoreSource(nameof(Medico.CreadoPor))]
    [MapperIgnoreSource(nameof(Medico.ModificadoPor))]
    private static partial MedicoInfo ToMedicoInfo(
        Medico entity
    );

    [MapperIgnoreSource(nameof(VentaPagador.Venta))]
    [MapperIgnoreSource(nameof(VentaPagador.Convenio))]
    private static partial VentaPagadorResponse ToVentaPagadorResponse(
        VentaPagador entity
    );

    [MapperIgnoreSource(nameof(Servicio.Activo))]
    [MapperIgnoreSource(nameof(Servicio.Descripcion))]
    [MapperIgnoreSource(nameof(Servicio.CategoriaServicioId))]
    [MapperIgnoreSource(nameof(Servicio.CategoriaServicio))]
    [MapperIgnoreSource(nameof(Servicio.Tarifas))]
    [MapperIgnoreSource(nameof(Servicio.FechaCreacion))]
    [MapperIgnoreSource(nameof(Servicio.FechaModificacion))]
    [MapperIgnoreSource(nameof(Servicio.CreadoPor))]
    [MapperIgnoreSource(nameof(Servicio.ModificadoPor))]
    private static partial ServiceInfo ToServiceInfo(
        Servicio entity
    );

    private static string MapNombreCompleto(Persona persona)
    {
        if (persona is null) return string.Empty;

        return string.Join(" ",
            new[]
                {
                    persona.Nombres,
                    persona.ApellidoPaterno,
                    persona.ApellidoMaterno
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
        );
    }

    [MapperIgnoreSource(nameof(CreateVentaRequest.Detalles))]
    [MapperIgnoreSource(nameof(CreateVentaRequest.Pagadores))]
    [MapperIgnoreTarget(nameof(VentaEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaEntity.Numero))]
    [MapperIgnoreTarget(nameof(VentaEntity.Admision))]
    [MapperIgnoreTarget(nameof(VentaEntity.Paciente))]
    [MapperIgnoreTarget(nameof(VentaEntity.Vendedor))]
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
    [MapperIgnoreTarget(nameof(VentaEntity.Vendedor))]
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