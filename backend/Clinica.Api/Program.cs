using Clinica.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddClinicaApi(builder.Configuration);

var app = builder.Build();

await app.UseClinicaSeedAsync();

app.UseClinicaPipeline();

app.MapClinicaEndpoints();

app.Run();