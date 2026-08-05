using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public sealed class UsuarioService(
    UserManager<Usuario> userManager,
    RoleManager<Rol> roleManager,
    AppDbContext dbContext)
{
    public async Task<PagedResult<UsuarioResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken)
    {
        var query = userManager.Users
            .Include(x => x.Persona)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                x.UserName!.Contains(term) ||
                x.Email!.Contains(term) ||
                x.Persona.Nombres.Contains(term) ||
                x.Persona.ApellidoPaterno.Contains(term) ||
                x.Persona.NumeroDocumento.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var usuarios = await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Skip((pagination.ValidPage - 1) * pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = new List<UsuarioResponse>();

        foreach (var usuario in usuarios)
        {
            var roles = await userManager.GetRolesAsync(usuario);

            items.Add(MapToResponse(usuario, roles.ToList()));
        }

        return new PagedResult<UsuarioResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<UsuarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await userManager.Users
                          .Include(x => x.Persona)
                          .AsNoTracking()
                          .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
                      ?? throw new NotFoundException("Usuario", id);

        var roles = await userManager.GetRolesAsync(usuario);

        return MapToResponse(usuario, roles.ToList());
    }

    public async Task<UsuarioResponse> CrearAsync(
        CreateUsuarioRequest request)
    {
        if (await userManager.FindByNameAsync(request.UserName) is not null)
        {
            throw new BusinessException("El nombre de usuario ya existe.");
        }

        if (await userManager.FindByEmailAsync(request.Email) is not null)
        {
            throw new BusinessException("El correo electrónico ya existe.");
        }

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync();

        try
        {
            var persona = MapToPersona(request.Persona);

            await ValidarDocumentoUnicoAsync(
                persona.TipoDocumento,
                persona.NumeroDocumento,
                persona.ComplementoDocumento);

            await dbContext.Personas.AddAsync(persona);
            await dbContext.SaveChangesAsync();

            var usuario = new Usuario
            {
                UserName = request.UserName.Trim(),
                Email = request.Email.Trim(),
                EmailConfirmed = true,
                Activo = true,
                DebeCambiarPassword = true,
                PersonaId = persona.Id,
                Persona = persona
            };

            (await userManager.CreateAsync(usuario, request.Password))
                .EnsureSuccess();

            if (request.Roles.Count > 0)
            {
                var nombresRoles = await ObtenerRoles(request.Roles);

                (await userManager.AddToRolesAsync(usuario, nombresRoles))
                    .EnsureSuccess();
            }

            await transaction.CommitAsync();

            var roles = await userManager.GetRolesAsync(usuario);

            return MapToResponse(usuario, roles.ToList());
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<UsuarioResponse> ActualizarAsync(
        int id,
        UpdateUsuarioRequest request)
    {
        var usuario = await userManager.FindByIdAsync(id.ToString())
                      ?? throw new NotFoundException("Usuario", id);

        if (await userManager.Users.AnyAsync(
                x => x.Id != id && x.NormalizedEmail == request.Email.Trim().ToUpperInvariant()))
        {
            throw new BusinessException("El correo electrónico ya existe.");
        }

        if (await userManager.Users.AnyAsync(
                x => x.Id != id && x.NormalizedUserName == request.UserName.Trim().ToUpperInvariant()))
        {
            throw new BusinessException("El nombre de usuario ya existe.");
        }

        usuario.Email = request.Email.Trim();
        usuario.UserName = request.UserName.Trim();
        usuario.Activo = request.Activo;

        (await userManager.UpdateAsync(usuario))
            .EnsureSuccess();

        var rolesActuales = await userManager.GetRolesAsync(usuario);

        if (rolesActuales.Count > 0)
        {
            (await userManager.RemoveFromRolesAsync(usuario, rolesActuales))
                .EnsureSuccess();
        }

        if (request.Roles.Count > 0)
        {
            var nombresRoles = await ObtenerRoles(request.Roles);

            (await userManager.AddToRolesAsync(usuario, nombresRoles))
                .EnsureSuccess();
        }

        var roles = await userManager.GetRolesAsync(usuario);

        await dbContext.Entry(usuario).Reference(x => x.Persona).LoadAsync();

        return MapToResponse(usuario, roles.ToList());
    }

    public async Task EliminarAsync(int id)
    {
        var usuario = await userManager.FindByIdAsync(id.ToString())
                      ?? throw new NotFoundException("Usuario", id);

        (await userManager.DeleteAsync(usuario))
            .EnsureSuccess();
    }

    private async Task ValidarDocumentoUnicoAsync(
        string tipoDocumento,
        string numeroDocumento,
        string? complementoDocumento)
    {
        var existe = await dbContext.Personas.AnyAsync(x =>
            x.TipoDocumento == tipoDocumento &&
            x.NumeroDocumento == numeroDocumento &&
            x.ComplementoDocumento == complementoDocumento);

        if (existe)
        {
            var descripcion = complementoDocumento is null
                ? $"{tipoDocumento} {numeroDocumento}"
                : $"{tipoDocumento} {numeroDocumento}-{complementoDocumento}";

            throw new ConflictException(
                $"Ya existe una persona con el documento '{descripcion}'.");
        }
    }

    private static Persona MapToPersona(PersonaUsuarioRequest request)
    {
        return new Persona
        {
            Nombres = request.Nombres.Trim(),
            ApellidoPaterno = request.ApellidoPaterno.Trim(),
            ApellidoMaterno = NormalizarOpcional(request.ApellidoMaterno),
            FechaNacimiento = request.FechaNacimiento,
            Telefono = NormalizarOpcional(request.Telefono),
            Direccion = NormalizarOpcional(request.Direccion),
            TipoDocumento = request.TipoDocumento.Trim(),
            NumeroDocumento = request.NumeroDocumento.Trim(),
            ExtensionDocumento = NormalizarOpcional(request.ExtensionDocumento),
            ComplementoDocumento = NormalizarOpcional(request.ComplementoDocumento),
            Genero = NormalizarOpcional(request.Genero),
            EstadoCivil = NormalizarOpcional(request.EstadoCivil),
            Activo = true
        };
    }

    private static UsuarioResponse MapToResponse(
        Usuario usuario,
        List<string> roles)
    {
        return new UsuarioResponse
        {
            Id = usuario.Id,
            Email = usuario.Email ?? string.Empty,
            UserName = usuario.UserName ?? string.Empty,
            Activo = usuario.Activo,
            DebeCambiarPassword = usuario.DebeCambiarPassword,
            Roles = roles,
            Persona = MapToPersonaResponse(usuario.Persona)
        };
    }

    private static PersonaResponse? MapToPersonaResponse(Persona? persona)
    {
        if (persona is null)
            return null;

        return new PersonaResponse
        {
            Id = persona.Id,
            Nombres = persona.Nombres,
            ApellidoPaterno = persona.ApellidoPaterno,
            ApellidoMaterno = persona.ApellidoMaterno,
            FechaNacimiento = persona.FechaNacimiento,
            Telefono = persona.Telefono,
            Direccion = persona.Direccion,
            TipoDocumento = persona.TipoDocumento,
            NumeroDocumento = persona.NumeroDocumento,
            ExtensionDocumento = persona.ExtensionDocumento,
            ComplementoDocumento = persona.ComplementoDocumento,
            Genero = persona.Genero,
            EstadoCivil = persona.EstadoCivil,
            Activo = persona.Activo,
            FechaCreacion = persona.FechaCreacion,
            FechaModificacion = persona.FechaModificacion,
            CreadoPor = persona.CreadoPor,
            ModificadoPor = persona.ModificadoPor
        };
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private async Task<List<string>> ObtenerRoles(
        IEnumerable<int> ids)
    {
        var roles = await roleManager.Roles
            .Where(x => ids.Contains(x.Id))
            .ToListAsync();

        if (roles.Count != ids.Count())
        {
            throw new BusinessException(
                "Uno o más roles no existen.");
        }

        return roles
            .Select(x => x.Name!)
            .ToList();
    }
}