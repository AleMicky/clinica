using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Modules.Seguridad.Usuarios;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class IdentitySeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Rol>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await SeedRoles(roleManager);
        await SeedAdmin(userManager, dbContext);
    }

    private static async Task SeedRoles(RoleManager<Rol> roleManager)
    {
        string[] roles =
        [
            "ADMINISTRADOR",
            "RECEPCION",
            "CAJA",
            "FARMACIA",
            "ALMACEN",
            "RECURSOS_HUMANOS"
        ];

        foreach (var role in roles)
        {
            if (await roleManager.RoleExistsAsync(role))
                continue;

            await roleManager.CreateAsync(new Rol
            {
                Name = role,
                NormalizedName = role.ToUpper(),
                Descripcion = role
            });
        }
    }

    private static async Task SeedAdmin(
        UserManager<Usuario> userManager,
        AppDbContext dbContext)
    {
        const string email = "admin@clinica.local";

        var usuario = await userManager.FindByEmailAsync(email);

        if (usuario != null)
            return;

        var persona = await dbContext.Personas.FirstOrDefaultAsync(
            x => x.TipoDocumento == "CI" && x.NumeroDocumento == "0000000");

        if (persona is null)
        {
            persona = new Persona
            {
                Nombres = "Administrador",
                ApellidoPaterno = "Sistema",
                TipoDocumento = "CI",
                NumeroDocumento = "0000000",
                Activo = true
            };

            await dbContext.Personas.AddAsync(persona);
            await dbContext.SaveChangesAsync();
        }

        usuario = new Usuario
        {
            UserName = "admin",
            Email = email,
            EmailConfirmed = true,
            Activo = true,
            DebeCambiarPassword = false,
            PersonaId = persona.Id
        };

        var result = await userManager.CreateAsync(
            usuario,
            "Admin123*");

        if (!result.Succeeded)
        {
            var errores = string.Join(
                Environment.NewLine,
                result.Errors.Select(x => x.Description));

            throw new Exception(errores);
        }

        await userManager.AddToRoleAsync(
            usuario,
            "ADMINISTRADOR");
    }
}