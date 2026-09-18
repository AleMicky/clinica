# syntax=docker/dockerfile:1

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Deshabilitar telemetria de .NET durante el build
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

# Copiar csproj y restaurar dependencias con cache persistente de NuGet
COPY ["apps/api/Clinica.Api.csproj", "apps/api/"]
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore "apps/api/Clinica.Api.csproj"

# Copiar el codigo fuente y publicar directamente (sin dotnet build redundante)
COPY ["apps/api/", "apps/api/"]
WORKDIR "/src/apps/api"
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish "Clinica.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-restore

# Stage 2: Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Clinica.Api.dll"]

