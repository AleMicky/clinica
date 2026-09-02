using System.Text;
using Clinica.Api.Data;
using Clinica.Api.Data.Seed;
using Clinica.Api.Modules;
using Clinica.Api.Modules.Notificaciones.Extensions;
using Clinica.Api.Modules.Notificaciones.Hubs;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Clinica.Api.Shared.Configuration;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Jwt;
using Clinica.Api.Shared.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using Scalar.AspNetCore;

var builder =
    WebApplication.CreateBuilder(args);

const string CorsPolicy = "DefaultCors";

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException(
                           "No se encontró la cadena de conexión DefaultConnection.");

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseSqlServer(connectionString);
    options.AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>());
});

builder.Services.AddDataProtection();

builder.Services
    .AddIdentityCore<Usuario>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<Rol>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
          ?? throw new InvalidOperationException("No se encontró la configuración Jwt.");

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,

            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey)),
            ClockSkew = TimeSpan.Zero
        };

        // SignalR obtiene aquí el JWT
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notificaciones"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration
                         .GetSection("Cors:AllowedOrigins")
                         .Get<string[]>()
                     ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddOpenApi();
builder.Services.Configure<ClinicaOptions>(builder.Configuration.GetSection(ClinicaOptions.SectionName));
builder.Services.AddShared();
builder.Services.AddModules();

builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.RequestMethod |
                            HttpLoggingFields.RequestPath |
                            HttpLoggingFields.RequestQuery |
                            HttpLoggingFields.ResponseStatusCode;

    options.CombineLogs = true;
});

QuestPDF.Settings.License = LicenseType.Community;

var app = builder.Build();

app.UseHttpLogging();

app.UseCors(CorsPolicy);

app.UseShared();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Clínica API")
            .WithPreferredScheme("Bearer")
            .WithHttpBearerAuthentication(bearer => { bearer.Token = string.Empty; });
    });
}

app.UseAuthentication();
app.UseAuthorization();

// NUEVO: HUB SIGNALR
app.MapHub<NotificacionHub>("/hubs/notificaciones").RequireAuthorization();

app.MapGet("/", () =>
    Results.Ok(new
    {
        application = "Clinica API",
        status = "running"
    }));

app.MapModules();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

if (app.Configuration.GetValue<bool>("RunSeeds", false))
{
    await IdentitySeed.SeedAsync(app.Services);
    await CatalogoSeed.SeedAsync(app.Services);
    await BancoSeed.SeedAsync(app.Services);
    await RecursosHumanosSeed.SeedAsync(app.Services);
    await ServiciosSeed.SeedAsync(app.Services);
    await TarifarioSeed.SeedAsync(app.Services);
    await EspecialidadSeed.SeedAsync(app.Services);
    await AlmacenSeed.SeedAsync(app.Services);
    await UnidadesMedidaSeed.SeedAsync(app.Services);
    await TipoMovimientoInventarioSeed.SeedAsync(app.Services);
    await OpcionMenuSeed.SeedAsync(app.Services);
    await RolOpcionMenuSeed.SeedAsync(app.Services);
}

app.Run();