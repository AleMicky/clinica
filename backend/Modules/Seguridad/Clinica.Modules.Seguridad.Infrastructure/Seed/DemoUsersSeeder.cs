using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.Seguridad.Application;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Seguridad.Infrastructure.Seed;

public static class DemoUsersSeeder
{
    private static readonly DateOnly DemoFechaNacimiento = new(1990, 1, 15);
    private const string DemoTelefono = "70000000";
    private const string DemoDireccion = "Av. Demo 123";

    private static readonly DemoUserDefinition[] DemoUsers =
    [
        new(
            "medico.demo",
            "Dr. Juan Pérez López",
            "Juan",
            "Pérez",
            "López",
            "medico@clinica.com",
            "10000001",
            SeguridadRoles.Medico),
        new(
            "recepcion.demo",
            "María Gutiérrez Vega",
            "María",
            "Gutiérrez",
            "Vega",
            "recepcion@clinica.com",
            "10000002",
            SeguridadRoles.Recepcionista),
        new(
            "enfermeria.demo",
            "Ana Morales Ríos",
            "Ana",
            "Morales",
            "Ríos",
            "enfermeria@clinica.com",
            "10000003",
            SeguridadRoles.Enfermeria),
        new(
            "farmacia.demo",
            "Carlos Mendoza Soliz",
            "Carlos",
            "Mendoza",
            "Soliz",
            "farmacia@clinica.com",
            "10000004",
            SeguridadRoles.Farmacia),
        new(
            "laboratorio.demo",
            "Luis Fernández Cruz",
            "Luis",
            "Fernández",
            "Cruz",
            "laboratorio@clinica.com",
            "10000005",
            SeguridadRoles.Laboratorio),
        new(
            "rrhh.demo",
            "Patricia Vargas Quispe",
            "Patricia",
            "Vargas",
            "Quispe",
            "rrhh@clinica.com",
            "10000006",
            SeguridadRoles.RecursosHumanos),
    ];

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DemoUsersSeeder");
        var configuration = services.GetRequiredService<IConfiguration>();

        if (!configuration.GetValue("Seed:SeedDemoUsers", true))
        {
            logger.LogInformation("Seed de usuarios demo deshabilitado.");
            return;
        }

        var demoPassword = configuration["Seed:DemoPassword"] ?? "Demo@2026!";
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var personaService = services.GetRequiredService<IPersonaService>();
        var personasContext = services.GetRequiredService<PersonasDbContext>();

        var catalogDefaults = await GetCatalogDefaultsAsync(personasContext, cancellationToken: default);
        if (catalogDefaults is null)
        {
            logger.LogWarning(
                "Catálogos de persona no disponibles; omitiendo seed de usuarios demo.");
            return;
        }

        foreach (var demo in DemoUsers)
        {
            await SeedDemoUserAsync(
                userManager,
                personaService,
                personasContext,
                demo,
                demoPassword,
                catalogDefaults,
                logger);
        }
    }

    private static async Task SeedDemoUserAsync(
        UserManager<ApplicationUser> userManager,
        IPersonaService personaService,
        PersonasDbContext personasContext,
        DemoUserDefinition demo,
        string password,
        CatalogDefaults catalogDefaults,
        ILogger logger)
    {
        var existingUser = await userManager.FindByNameAsync(demo.UserName);
        if (existingUser is not null)
        {
            await EnsureUserInRoleAsync(userManager, existingUser, demo.Role, logger);
            await EnsurePersonaLinkAsync(
                userManager,
                personasContext,
                existingUser,
                demo,
                catalogDefaults,
                personaService,
                logger);
            return;
        }

        var persona = await FindPersonaByDocumentoAsync(
            personasContext,
            demo.NumeroDocumento,
            catalogDefaults.TipoDocumentoId);

        persona ??= await personaService.CreateAsync(
            new CreatePersonaRequest(
                catalogDefaults.TipoDocumentoId,
                demo.NumeroDocumento,
                demo.Nombres,
                demo.ApellidoPaterno,
                demo.ApellidoMaterno,
                DemoFechaNacimiento,
                catalogDefaults.SexoId,
                catalogDefaults.EstadoCivilId,
                DemoTelefono,
                DemoDireccion,
                catalogDefaults.ExtensionDocumentoId),
            CancellationToken.None);

        var personaLinked = await userManager.Users
            .AnyAsync(x => x.PersonaId == persona.Id);

        if (personaLinked)
        {
            logger.LogWarning(
                "La persona con documento '{Documento}' ya tiene un usuario vinculado; omitiendo '{UserName}'.",
                demo.NumeroDocumento,
                demo.UserName);
            return;
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = demo.UserName,
            Email = demo.Email,
            NombreCompleto = demo.NombreCompleto,
            PersonaId = persona.Id,
            EmailConfirmed = true,
            Activo = true
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            logger.LogWarning(
                "No se pudo crear el usuario demo '{UserName}': {Errors}",
                demo.UserName,
                string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(user, demo.Role);
        logger.LogInformation(
            "Usuario demo '{UserName}' creado con rol '{Role}'.",
            demo.UserName,
            demo.Role);
    }

    private static async Task EnsurePersonaLinkAsync(
        UserManager<ApplicationUser> userManager,
        PersonasDbContext personasContext,
        ApplicationUser user,
        DemoUserDefinition demo,
        CatalogDefaults catalogDefaults,
        IPersonaService personaService,
        ILogger logger)
    {
        if (user.PersonaId is not null)
        {
            return;
        }

        var persona = await FindPersonaByDocumentoAsync(
            personasContext,
            demo.NumeroDocumento,
            catalogDefaults.TipoDocumentoId);

        if (persona is null)
        {
            try
            {
                persona = await personaService.CreateAsync(
                    new CreatePersonaRequest(
                        catalogDefaults.TipoDocumentoId,
                        demo.NumeroDocumento,
                        demo.Nombres,
                        demo.ApellidoPaterno,
                        demo.ApellidoMaterno,
                        DemoFechaNacimiento,
                        catalogDefaults.SexoId,
                        catalogDefaults.EstadoCivilId,
                        DemoTelefono,
                        DemoDireccion,
                        catalogDefaults.ExtensionDocumentoId),
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "No se pudo crear la persona para el usuario demo existente '{UserName}'.",
                    demo.UserName);
                return;
            }
        }

        user.PersonaId = persona.Id;
        if (string.IsNullOrWhiteSpace(user.NombreCompleto))
        {
            user.NombreCompleto = demo.NombreCompleto;
        }

        var updateResult = await userManager.UpdateAsync(user);
        if (updateResult.Succeeded)
        {
            logger.LogInformation(
                "Persona vinculada al usuario demo existente '{UserName}'.",
                demo.UserName);
        }
    }

    private static async Task<PersonaResponse?> FindPersonaByDocumentoAsync(
        PersonasDbContext context,
        string numeroDocumento,
        Guid tipoDocumentoId)
    {
        return await context.Personas
            .AsNoTracking()
            .Where(x =>
                x.TipoDocumentoId == tipoDocumentoId &&
                x.NumeroDocumento == numeroDocumento.Trim())
            .Select(x => new PersonaResponse(
                x.Id,
                x.TipoDocumentoId,
                x.TipoDocumento.Nombre,
                x.NumeroDocumento,
                x.ExtensionDocumentoId,
                x.ExtensionDocumento != null ? x.ExtensionDocumento.Nombre : null,
                x.ComplementoDocumento,
                x.Nombres,
                x.ApellidoPaterno,
                x.ApellidoMaterno,
                $"{x.Nombres} {x.ApellidoPaterno} {x.ApellidoMaterno}".Trim(),
                x.FechaNacimiento,
                x.SexoId,
                x.Sexo.Nombre,
                x.EstadoCivilId,
                x.EstadoCivil.Nombre,
                x.Telefono,
                x.Direccion))
            .FirstOrDefaultAsync();
    }

    private static async Task<CatalogDefaults?> GetCatalogDefaultsAsync(
        PersonasDbContext context,
        CancellationToken cancellationToken)
    {
        var tipoDocumentoId = await GetFirstCatalogItemIdAsync(context, "TIPO_DOCUMENTO", cancellationToken);
        var extensionDocumentoId = await GetFirstCatalogItemIdAsync(context, "EXTENSION_DOCUMENTO", cancellationToken);
        var sexoId = await GetFirstCatalogItemIdAsync(context, "SEXO", cancellationToken);
        var estadoCivilId = await GetFirstCatalogItemIdAsync(context, "ESTADO_CIVIL", cancellationToken);

        if (tipoDocumentoId is null || sexoId is null || estadoCivilId is null)
        {
            return null;
        }

        return new CatalogDefaults(
            tipoDocumentoId.Value,
            extensionDocumentoId,
            sexoId.Value,
            estadoCivilId.Value);
    }

    private static async Task<Guid?> GetFirstCatalogItemIdAsync(
        PersonasDbContext context,
        string grupoCodigo,
        CancellationToken cancellationToken)
    {
        var grupoId = await context.Set<CatalogoGrupo>()
            .AsNoTracking()
            .Where(x => x.Codigo == grupoCodigo)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (grupoId == Guid.Empty)
        {
            return null;
        }

        var id = await context.Set<CatalogoItem>()
            .AsNoTracking()
            .Where(x => x.CatalogoGrupoId == grupoId)
            .OrderBy(x => x.Orden)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return id == Guid.Empty ? null : id;
    }

    private static async Task EnsureUserInRoleAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string roleName,
        ILogger logger)
    {
        if (await userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await userManager.AddToRoleAsync(user, roleName);

        if (result.Succeeded)
        {
            logger.LogInformation(
                "Rol '{Role}' asignado al usuario '{UserName}'.",
                roleName,
                user.UserName);
        }
    }

    private sealed record DemoUserDefinition(
        string UserName,
        string NombreCompleto,
        string Nombres,
        string ApellidoPaterno,
        string ApellidoMaterno,
        string Email,
        string NumeroDocumento,
        string Role);

    private sealed record CatalogDefaults(
        Guid TipoDocumentoId,
        Guid? ExtensionDocumentoId,
        Guid SexoId,
        Guid EstadoCivilId);
}
