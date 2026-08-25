using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Modules.Cajas.Caja.Entity;
using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Clinica.Api.Modules.Parametros.Correlativo.Entity;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity;
using Clinica.Api.Modules.Seguridad.OpcionMenu.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data;

public class AppDbContext(
    DbContextOptions<AppDbContext> options)
    : IdentityDbContext<Usuario, Rol, int>(options)
{
    public DbSet<CatalogoGrupo> CatalogosGrupos => Set<CatalogoGrupo>();
    public DbSet<CatalogoItem> CatalogosItems => Set<CatalogoItem>();
    public DbSet<UnidadesMedida> UnidadesMedida => Set<UnidadesMedida>();
    public DbSet<Moneda> Monedas => Set<Moneda>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();
    public DbSet<Banco> Bancos => Set<Banco>();
    public DbSet<CuentaBancaria> CuentasBancarias => Set<CuentaBancaria>();
    public DbSet<TipoCambio> TiposCambio => Set<TipoCambio>();
    public DbSet<Persona> Personas => Set<Persona>();
    public DbSet<TipoArea> TiposArea => Set<TipoArea>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Cargo> Cargos => Set<Cargo>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<AsignacionEmpleado> AsignacionesEmpleado => Set<AsignacionEmpleado>();
    public DbSet<Especialidad> Especialidades => Set<Especialidad>();
    public DbSet<Medico> Medicos => Set<Medico>();
    public DbSet<MedicoEspecialidad> MedicosEspecialidades => Set<MedicoEspecialidad>();
    public DbSet<MedicoServicioAcuerdo> MedicosServiciosAcuerdos => Set<MedicoServicioAcuerdo>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<PacienteConvenio> PacientesConvenios => Set<PacienteConvenio>();
    public DbSet<Admision> Admisiones => Set<Admision>();
    public DbSet<AdmisionDetalle> AdmisionesDetalles => Set<AdmisionDetalle>();
    public DbSet<CategoriaServicio> CategoriaServicio => Set<CategoriaServicio>();
    public DbSet<Convenio> Convenios => Set<Convenio>();
    public DbSet<ConvenioTarifario> ConveniosTarifarios => Set<ConvenioTarifario>();
    public DbSet<Servicio> Servicio => Set<Servicio>();
    public DbSet<Tarifario> Tarifarios => Set<Tarifario>();
    public DbSet<TarifarioDetalle> TarifarioDetalles => Set<TarifarioDetalle>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<VentaDetalle> VentaDetalles => Set<VentaDetalle>();
    public DbSet<VentaPagador> VentaPagadores => Set<VentaPagador>();
    public DbSet<Correlativo>  Correlativo => Set<Correlativo>();
    public DbSet<Caja> Cajas => Set<Caja>();
    public DbSet<TurnoCaja> TurnosCaja => Set<TurnoCaja>();
    public DbSet<ArqueoCaja> ArqueosCaja => Set<ArqueoCaja>();
    public DbSet<DetalleArqueoCaja> DetalleArqueosCaja => Set<DetalleArqueoCaja>();
    public DbSet<MovimientoCaja> MovimientosCaja => Set<MovimientoCaja>();
    public DbSet<Cobro> Cobros => Set<Cobro>();
    public DbSet<CobroDetalle> CobroDetalles => Set<CobroDetalle>();
    public DbSet<OpcionMenu> OpcionesMenu => Set<OpcionMenu>();
    public DbSet<RolOpcionMenu> RolesOpcionesMenu => Set<RolOpcionMenu>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ConfigurarTablasIdentity(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    private static void ConfigurarTablasIdentity(ModelBuilder builder)
    {
        builder.Entity<Usuario>().ToTable("Usuarios");
        builder.Entity<Rol>().ToTable("Roles");

        builder.Entity<IdentityUserRole<int>>()
            .ToTable("UsuariosRoles");

        builder.Entity<IdentityUserClaim<int>>()
            .ToTable("UsuariosClaims");

        builder.Entity<IdentityUserLogin<int>>()
            .ToTable("UsuariosLogins");

        builder.Entity<IdentityRoleClaim<int>>()
            .ToTable("RolesClaims");

        builder.Entity<IdentityUserToken<int>>()
            .ToTable("UsuariosTokens");
    }
}