using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Clinica.Modules.Laboratorio.Infrastructure.Persistence;

public class LaboratorioDbContextFactory : IDesignTimeDbContextFactory<LaboratorioDbContext>
{
    public LaboratorioDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var optionsBuilder = new DbContextOptionsBuilder<LaboratorioDbContext>();
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));

        return new LaboratorioDbContext(optionsBuilder.Options);
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
