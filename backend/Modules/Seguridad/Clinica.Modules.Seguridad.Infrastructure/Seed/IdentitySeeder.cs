using Clinica.Modules.Seguridad.Application;
using Clinica.Modules.Seguridad.Domain.Entities;
using Clinica.Modules.Seguridad.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Seguridad.Infrastructure.Seed;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("IdentitySeeder");

        var context = services.GetRequiredService<ClinicaDbContext>();
        await context.Database.MigrateAsync();

        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = services.GetRequiredService<IConfiguration>();

        await SeedRolesAsync(roleManager, logger);
        await SeedAdminUserAsync(userManager, configuration, logger);
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager, ILogger logger)
    {
        var roles = new[]
        {
            (SeguridadRoles.Administrador, "Acceso total al sistema"),
            (SeguridadRoles.Medico, "Personal médico"),
            (SeguridadRoles.Recepcionista, "Personal de recepción")
        };

        foreach (var (name, descripcion) in roles)
        {
            if (await roleManager.RoleExistsAsync(name))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new ApplicationRole
            {
                Id = Guid.NewGuid(),
                Name = name,
                NormalizedName = name.ToUpperInvariant(),
                Descripcion = descripcion
            });

            if (result.Succeeded)
            {
                logger.LogInformation("Rol '{Role}' creado.", name);
            }
        }
    }

    private static async Task SeedAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger logger)
    {
        var adminUserName = configuration["Seed:AdminUserName"] ?? "admin";
        var adminEmail = configuration["Seed:AdminEmail"];
        var adminPassword = configuration["Seed:AdminPassword"] ?? "Admin@2026!";

        var existing = await userManager.FindByNameAsync(adminUserName);
        if (existing is not null)
        {
            return;
        }

        var legacyAdmin = await userManager.FindByEmailAsync(adminEmail ?? string.Empty);
        if (legacyAdmin is not null && legacyAdmin.UserName != adminUserName)
        {
            legacyAdmin.UserName = adminUserName;
            var updateResult = await userManager.UpdateAsync(legacyAdmin);
            if (updateResult.Succeeded)
            {
                logger.LogInformation("Usuario admin migrado al nombre de usuario '{UserName}'.", adminUserName);
            }

            return;
        }

        var admin = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = adminUserName,
            Email = adminEmail,
            NombreCompleto = "Administrador del Sistema",
            EmailConfirmed = !string.IsNullOrWhiteSpace(adminEmail)
        };

        var result = await userManager.CreateAsync(admin, adminPassword);
        if (!result.Succeeded)
        {
            logger.LogWarning("No se pudo crear el usuario admin: {Errors}",
                string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(admin, SeguridadRoles.Administrador);
        logger.LogInformation("Usuario administrador '{UserName}' creado.", adminUserName);
    }
}
