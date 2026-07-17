using Clinica.Api.Extensions;

var seedOnly = args.Any(static a => a is "--seed" or "--seed-only");
var hostArgs = args.Where(static a => a is not ("--seed" or "--seed-only")).ToArray();

var builder = WebApplication.CreateBuilder(hostArgs);

builder.Services.AddClinicaApi(builder.Configuration);

var app = builder.Build();

await app.UseClinicaSeedAsync(force: seedOnly);

if (seedOnly)
    return;

app.UseClinicaPipeline();

app.MapClinicaEndpoints();

app.Run();
