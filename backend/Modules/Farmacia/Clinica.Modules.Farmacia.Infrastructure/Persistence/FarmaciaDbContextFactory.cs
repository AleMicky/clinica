using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Clinica.Modules.Farmacia.Infrastructure.Persistence;

public class FarmaciaDbContextFactory : IDesignTimeDbContextFactory<FarmaciaDbContext>
{
    public FarmaciaDbContext CreateDbContext(string[] args)
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
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();
        var optionsBuilder = new DbContextOptionsBuilder<FarmaciaDbContext>();
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        return new FarmaciaDbContext(optionsBuilder.Options);
    }
}
