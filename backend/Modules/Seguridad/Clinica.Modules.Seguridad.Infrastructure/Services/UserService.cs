using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.Modules.Seguridad.Infrastructure.Identity;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Seguridad.Infrastructure.Services;

public sealed class UserService(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IPersonaService personaService
) : IUserService
{
    public async Task<UserResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var userNameExists = await userManager.Users
            .AnyAsync(x => x.UserName == request.UserName, cancellationToken);

        if (userNameExists)
            throw new BadRequestException($"El usuario '{request.UserName}' ya existe.");

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await userManager.Users
                .AnyAsync(x => x.Email == request.Email, cancellationToken);

            if (emailExists)
                throw new BadRequestException($"El correo '{request.Email}' ya está registrado.");
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.UserName.Trim(),
            Email = request.Email?.Trim(),
            NombreCompleto = request.NombreCompleto.Trim(),
            EmailConfirmed = !string.IsNullOrWhiteSpace(request.Email),
            Activo = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));

        if (!string.IsNullOrWhiteSpace(request.Role))
            await AssignRoleInternalAsync(user, request.Role.Trim());

        var roles = await userManager.GetRolesAsync(user);

        return await MapToResponseAsync(user, roles, cancellationToken);
    }

    public async Task<UserResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);
        var roles = await userManager.GetRolesAsync(user);

        return await MapToResponseAsync(user, roles, cancellationToken);
    }

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var users = await userManager.Users
            .AsNoTracking()
            .OrderBy(x => x.NombreCompleto)
            .ToListAsync(cancellationToken);

        var responses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            responses.Add(await MapToResponseAsync(user, roles, cancellationToken));
        }

        return responses;
    }

    public async Task<UserResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailExists = await userManager.Users
                .AnyAsync(
                    x => x.Email == request.Email && x.Id != id,
                    cancellationToken);

            if (emailExists)
                throw new BadRequestException($"El correo '{request.Email}' ya está registrado.");
        }

        user.NombreCompleto = request.NombreCompleto.Trim();
        user.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        user.Activo = request.Activo;
        user.EmailConfirmed = !string.IsNullOrWhiteSpace(user.Email);

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));

        var roles = await userManager.GetRolesAsync(user);

        return await MapToResponseAsync(user, roles, cancellationToken);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(id, cancellationToken);

        var result = await userManager.DeleteAsync(user);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));
    }

    public async Task AssignRoleAsync(
        Guid userId,
        AssignRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(userId, cancellationToken);

        await AssignRoleInternalAsync(user, request.Role.Trim());
    }

    public async Task RemoveRoleAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(userId, cancellationToken);
        var roleName = role.Trim();

        if (string.IsNullOrWhiteSpace(roleName))
            throw new BadRequestException("El rol es obligatorio.");

        if (!await userManager.IsInRoleAsync(user, roleName))
            throw new NotFoundException($"El usuario no tiene asignado el rol '{roleName}'.");

        var result = await userManager.RemoveFromRoleAsync(user, roleName);

        if (!result.Succeeded)
            throw new BadRequestException(GetIdentityErrors(result));
    }

    private async Task<ApplicationUser> FindUserAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await userManager.Users
                   .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"Usuario con id '{id}' no encontrado.");
    }

    private async Task AssignRoleInternalAsync(ApplicationUser user, string roleName)
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

    private async Task<UserResponse> MapToResponseAsync(
        ApplicationUser user,
        IList<string> roles,
        CancellationToken cancellationToken)
    {
        string? personaNombreCompleto = null;
        string? personaNumeroDocumento = null;

        if (user.PersonaId is { } personaId)
        {
            var persona = await personaService.GetByIdAsync(personaId, cancellationToken);

            if (persona is not null)
            {
                personaNombreCompleto = persona.NombreCompleto;
                personaNumeroDocumento = persona.NumeroDocumento;
            }
        }

        return new UserResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.NombreCompleto,
            user.Email,
            user.Activo,
            roles.ToList(),
            user.PersonaId,
            personaNombreCompleto,
            personaNumeroDocumento);
    }
}
