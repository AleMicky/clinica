using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public sealed class UsuarioPersonaService(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IPersonaService personaService
) : IUsuarioPersonaService
{
    public async Task<UsuarioPersonaResponse> CreateAsync(
        CreateUsuarioPersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        PersonaResponse persona;
        var personaCreated = false;

        if (request.Modo == "nueva")
        {
            if (request.Persona is null)
                throw new BadRequestException("Debe completar los datos de la nueva persona.");

            persona = await personaService.CreateAsync(request.Persona, cancellationToken);
            personaCreated = true;
        }
        else
        {
            if (request.PersonaId is not { } personaId || personaId == Guid.Empty)
                throw new BadRequestException("Debe seleccionar una persona existente.");

            persona = await personaService.GetByIdAsync(personaId, cancellationToken)
                      ?? throw new NotFoundException("Persona no encontrada.");

            var personaLinked = await userManager.Users
                .AnyAsync(x => x.PersonaId == persona.Id, cancellationToken);

            if (personaLinked)
                throw new BadRequestException("La persona ya tiene un usuario vinculado.");
        }

        var userName = string.IsNullOrWhiteSpace(request.UserName)
            ? persona.NumeroDocumento.Trim()
            : request.UserName.Trim();

        try
        {
            await EnsureUserNameIsAvailableAsync(userName, cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.Email))
                await EnsureEmailIsAvailableAsync(request.Email.Trim(), cancellationToken);

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                Email = request.Email?.Trim(),
                NombreCompleto = persona.NombreCompleto,
                PersonaId = persona.Id,
                EmailConfirmed = !string.IsNullOrWhiteSpace(request.Email),
                Activo = true
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
                throw new BadRequestException(GetIdentityErrors(result));

            foreach (var role in request.Roles.Select(r => r.Trim()).Where(r => !string.IsNullOrWhiteSpace(r)))
                await AssignRoleInternalAsync(user, role, cancellationToken);

            var roles = await userManager.GetRolesAsync(user);

            return new UsuarioPersonaResponse(
                user.Id,
                user.UserName ?? string.Empty,
                user.NombreCompleto,
                user.Email,
                user.Activo,
                roles.ToList(),
                persona.Id,
                persona.NombreCompleto);
        }
        catch
        {
            if (personaCreated)
                await personaService.DeleteAsync(persona.Id, cancellationToken);

            throw;
        }
    }

    private async Task EnsureUserNameIsAvailableAsync(
        string userName,
        CancellationToken cancellationToken)
    {
        _ = cancellationToken;
        var existing = await userManager.FindByNameAsync(userName);

        if (existing is not null)
            throw new BadRequestException($"El usuario '{userName}' ya existe.");
    }

    private async Task EnsureEmailIsAvailableAsync(
        string email,
        CancellationToken cancellationToken)
    {
        var exists = await userManager.Users
            .AnyAsync(x => x.Email == email, cancellationToken);

        if (exists)
            throw new BadRequestException($"El correo '{email}' ya está registrado.");
    }

    private async Task AssignRoleInternalAsync(
        ApplicationUser user,
        string roleName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            throw new BadRequestException("El rol es obligatorio.");

        var roleExists = await roleManager.RoleExistsAsync(roleName);

        if (!roleExists)
            throw new NotFoundException($"El rol '{roleName}' no existe.");

        if (await userManager.IsInRoleAsync(user, roleName))
            return;

        var result = await userManager.AddToRoleAsync(user, roleName);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));
    }

    private static string GetIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(e => e.Description));
    }
}
