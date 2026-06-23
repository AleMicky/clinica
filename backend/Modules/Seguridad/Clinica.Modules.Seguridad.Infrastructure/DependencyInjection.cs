using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.Modules.Seguridad.Infrastructure.Jwt;
using Clinica.Modules.Seguridad.Infrastructure.Persistence;
using Clinica.Modules.Seguridad.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Seguridad.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSeguridadInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<SeguridadDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // IdentityCore: solo gestión de usuarios/roles en BD, sin cookies ni redirects (API pura con JWT).
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.User.RequireUniqueEmail = false;
            })
            .AddRoles<ApplicationRole>()
            .AddEntityFrameworkStores<SeguridadDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();

        return services;
    }
}
