using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.Seguridad.Roles;
using Clinica.Api.Modules.Seguridad.Roles.Entity;
using Clinica.Api.Modules.Seguridad.Usuarios.Dtos;
using Clinica.Api.Modules.Seguridad.Usuarios.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persona = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.Seguridad.Usuarios.Services;

public sealed class UsuarioService(
    UserManager<Usuario> userManager,
    RoleManager<Rol> roleManager,
    AppDbContext dbContext)
{
    public async Task<PagedResult<UsuarioResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = userManager.Users
            .Include(x => x.Persona)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                (x.UserName != null && x.UserName.Contains(term)) ||
                (x.Email != null && x.Email.Contains(term)) ||
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

        var items = new List<UsuarioResponse>(usuarios.Count);

        foreach (var usuario in usuarios)
        {
            var roles = await userManager.GetRolesAsync(usuario);

            items.Add(
                MapToResponse(
                    usuario,
                    roles.ToList()));
        }

        return new PagedResult<UsuarioResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<UsuarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var usuario = await userManager.Users
                          .Include(x => x.Persona)
                          .AsNoTracking()
                          .FirstOrDefaultAsync(
                              x => x.Id == id,
                              cancellationToken)
                      ?? throw new NotFoundException("Usuario", id);

        var roles = await userManager.GetRolesAsync(usuario);

        return MapToResponse(
            usuario,
            roles.ToList());
    }

    public async Task<UsuarioResponse> CrearAsync(
        CreateUsuarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var userName = request.UserName.TrimRequired();
        var email = request.Email.TrimRequired();

        var tipoDocumento = request.Persona.TipoDocumento.TrimUpperRequired();
        var numeroDocumento = request.Persona.NumeroDocumento.TrimUpperRequired();
        var complementoDocumento = request.Persona.ComplementoDocumento.TrimUpperOrNull();

        await ValidarUsuarioUnicoAsync(
            userName,
            email);

        await ValidarDocumentoUnicoAsync(
            tipoDocumento,
            numeroDocumento,
            complementoDocumento,
            personaIdExcluir: null,
            cancellationToken);

        var nombresRoles = await ValidarRolesAsync(request.Roles);

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var persona = new Persona
            {
                Nombres = request.Persona.Nombres.TrimRequired(),
                ApellidoPaterno = request.Persona.ApellidoPaterno.TrimRequired(),
                ApellidoMaterno = request.Persona.ApellidoMaterno.TrimOrNull(),

                FechaNacimiento = request.Persona.FechaNacimiento,

                Telefono = request.Persona.Telefono.TrimOrNull(),
                Direccion = request.Persona.Direccion.TrimOrNull(),

                TipoDocumento = tipoDocumento,
                NumeroDocumento = numeroDocumento,
                ExtensionDocumento = request.Persona.ExtensionDocumento.TrimUpperOrNull(),
                ComplementoDocumento = complementoDocumento,

                Genero = request.Persona.Genero.TrimUpperOrNull(),
                EstadoCivil = request.Persona.EstadoCivil.TrimUpperOrNull()
            };

            await dbContext.Personas.AddAsync(
                persona,
                cancellationToken);

            var empleado = new Empleado
            {
                Persona = persona
            };

            await dbContext.Empleados.AddAsync(
                empleado,
                cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);

            var usuario = new Usuario
            {
                UserName = userName,
                Email = email,
                EmailConfirmed = true,

                Activo = request.Activo,
                DebeCambiarPassword = true,

                PersonaId = persona.Id,
                Persona = persona
            };

            var createResult = await userManager.CreateAsync(
                usuario,
                request.Password);

            createResult.EnsureSuccess();

            if (nombresRoles.Count > 0)
            {
                var rolesResult = await userManager.AddToRolesAsync(
                    usuario,
                    nombresRoles);

                rolesResult.EnsureSuccess();
            }

            await transaction.CommitAsync(cancellationToken);

            var roles = await userManager.GetRolesAsync(usuario);

            return MapToResponse(
                usuario,
                roles.ToList());
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<UsuarioResponse> ActualizarAsync(
        int id,
        UpdateUsuarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var usuario = await userManager.Users
                          .Include(x => x.Persona)
                          .FirstOrDefaultAsync(
                              x => x.Id == id,
                              cancellationToken)
                      ?? throw new NotFoundException("Usuario", id);

        var userName = request.UserName.TrimRequired();
        var email = request.Email.TrimRequired();

        var tipoDocumento = request.Persona.TipoDocumento.TrimUpperRequired();
        var numeroDocumento = request.Persona.NumeroDocumento.TrimUpperRequired();
        var complementoDocumento = request.Persona.ComplementoDocumento.TrimUpperOrNull();

        await ValidarUsuarioUnicoAsync(
            userName,
            email,
            id);

        await ValidarDocumentoUnicoAsync(
            tipoDocumento,
            numeroDocumento,
            complementoDocumento,
            usuario.PersonaId,
            cancellationToken);

        var nombresRoles = await ValidarRolesAsync(request.Roles);

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            usuario.UserName = userName;
            usuario.Email = email;
            usuario.Activo = request.Activo;
            usuario.Persona.Nombres = request.Persona.Nombres.TrimRequired();
            usuario.Persona.ApellidoPaterno = request.Persona.ApellidoPaterno.TrimRequired();
            usuario.Persona.ApellidoMaterno = request.Persona.ApellidoMaterno.TrimOrNull();
            usuario.Persona.FechaNacimiento = request.Persona.FechaNacimiento;
            usuario.Persona.Telefono = request.Persona.Telefono.TrimOrNull();
            usuario.Persona.Direccion = request.Persona.Direccion.TrimOrNull();
            usuario.Persona.TipoDocumento = tipoDocumento;
            usuario.Persona.NumeroDocumento = numeroDocumento;
            usuario.Persona.ExtensionDocumento = request.Persona.ExtensionDocumento.TrimUpperOrNull();
            usuario.Persona.ComplementoDocumento = complementoDocumento;
            usuario.Persona.Genero = request.Persona.Genero.TrimUpperOrNull();
            usuario.Persona.EstadoCivil = request.Persona.EstadoCivil.TrimUpperOrNull();

            var updateResult = await userManager.UpdateAsync(usuario);

            updateResult.EnsureSuccess();

            await ActualizarRolesAsync(
                usuario,
                nombresRoles);

            await dbContext.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            var roles = await userManager.GetRolesAsync(usuario);

            return MapToResponse(
                usuario,
                roles.ToList());
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var usuario = await userManager.Users
                          .FirstOrDefaultAsync(
                              x => x.Id == id,
                              cancellationToken)
                      ?? throw new NotFoundException("Usuario", id);

        var result = await userManager.DeleteAsync(usuario);

        result.EnsureSuccess();
    }

    private async Task ValidarUsuarioUnicoAsync(
        string userName,
        string email,
        int? usuarioIdExcluir = null)
    {
        var usuarioPorNombre =
            await userManager.FindByNameAsync(userName);

        if (usuarioPorNombre is not null &&
            usuarioPorNombre.Id != usuarioIdExcluir)
        {
            throw new ConflictException(
                $"El nombre de usuario '{userName}' ya existe.");
        }

        var usuarioPorEmail =
            await userManager.FindByEmailAsync(email);

        if (usuarioPorEmail is not null &&
            usuarioPorEmail.Id != usuarioIdExcluir)
        {
            throw new ConflictException(
                $"El correo electrónico '{email}' ya existe.");
        }
    }

    private async Task ValidarDocumentoUnicoAsync(
        string tipoDocumento,
        string numeroDocumento,
        string? complementoDocumento,
        int? personaIdExcluir,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Personas
            .AsNoTracking()
            .AnyAsync(
                x =>
                    (!personaIdExcluir.HasValue ||
                     x.Id != personaIdExcluir.Value) &&
                    x.TipoDocumento == tipoDocumento &&
                    x.NumeroDocumento == numeroDocumento &&
                    x.ComplementoDocumento == complementoDocumento,
                cancellationToken);

        if (!existe)
        {
            return;
        }

        var documento = complementoDocumento is null
            ? $"{tipoDocumento} {numeroDocumento}"
            : $"{tipoDocumento} {numeroDocumento}-{complementoDocumento}";

        throw new ConflictException(
            $"Ya existe una persona con el documento '{documento}'.");
    }

    private async Task<List<string>> ValidarRolesAsync(
        IEnumerable<string> nombres)
    {
        var roles = nombres
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var rol in roles)
        {
            if (!await roleManager.RoleExistsAsync(rol))
            {
                throw new BusinessException(
                    $"El rol '{rol}' no existe.");
            }
        }

        return roles;
    }

    private async Task ActualizarRolesAsync(
        Usuario usuario,
        List<string> nuevosRoles)
    {
        var rolesActuales =
            await userManager.GetRolesAsync(usuario);

        var rolesEliminar = rolesActuales
            .Except(
                nuevosRoles,
                StringComparer.OrdinalIgnoreCase)
            .ToList();

        var rolesAgregar = nuevosRoles
            .Except(
                rolesActuales,
                StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (rolesEliminar.Count > 0)
        {
            var result = await userManager.RemoveFromRolesAsync(
                usuario,
                rolesEliminar);

            result.EnsureSuccess();
        }

        if (rolesAgregar.Count > 0)
        {
            var result = await userManager.AddToRolesAsync(
                usuario,
                rolesAgregar);

            result.EnsureSuccess();
        }
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

    private static UsuarioPersonaResponse MapToPersonaResponse(
        Persona persona)
    {
        return new UsuarioPersonaResponse
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
            EstadoCivil = persona.EstadoCivil
        };
    }
}