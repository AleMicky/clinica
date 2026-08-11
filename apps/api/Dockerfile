# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["apps/api/Clinica.Api.csproj", "apps/api/"]
RUN dotnet restore "apps/api/Clinica.Api.csproj"

# Copy all files and build
COPY ["apps/api/", "apps/api/"]
WORKDIR "/src/apps/api"
RUN dotnet build "Clinica.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Clinica.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Clinica.Api.dll"]
