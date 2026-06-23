using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Clinica.Modules.Seguridad.Infrastructure.Persistence;

public class SeguridadDbContextFactory : IDesignTimeDbContextFactory<SeguridadDbContext>
{
    public SeguridadDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var optionsBuilder = new DbContextOptionsBuilder<SeguridadDbContext>();
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));

        return new SeguridadDbContext(optionsBuilder.Options);
    }

    private static IConfiguration BuildConfiguration()
    {
        var searchPaths = new[]
        {
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), "Clinica.Api"),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "Clinica.Api")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "Clinica.Api")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "Clinica.Api"))
        };

        var basePath = searchPaths.FirstOrDefault(path => File.Exists(Path.Combine(path, "appsettings.json")))
            ?? Directory.GetCurrentDirectory();

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();
    }
}
