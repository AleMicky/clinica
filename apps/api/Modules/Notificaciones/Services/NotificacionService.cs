using Clinica.Api.Data;
using Clinica.Api.Modules.Notificaciones.Dtos;
using Clinica.Api.Modules.Notificaciones.Entity;
using Clinica.Api.Modules.Notificaciones.Enums;
using Clinica.Api.Modules.Notificaciones.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Notificaciones.Services;

public interface INotificacionService
{
    Task<NotificacionResponse> CrearAsync(
        CrearNotificacionRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificacionResponse>> ListarAsync(
        int usuarioId,
        int cantidad = 20,
        CancellationToken cancellationToken = default);

    Task<int> ObtenerCantidadNoLeidasAsync(
        int usuarioId,
        CancellationToken cancellationToken = default);

    Task MarcarComoLeidaAsync(
        int id,
        int usuarioId,
        CancellationToken cancellationToken = default);

    Task MarcarTodasComoLeidasAsync(
        int usuarioId,
        CancellationToken cancellationToken = default);
}

public class NotificacionService(
    AppDbContext dbContext,
    IHubContext<NotificacionHub> hubContext
) : INotificacionService
{
    public async Task<NotificacionResponse> CrearAsync(
        CrearNotificacionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.UsuarioId <= 0)
        {
            throw new ArgumentException("El UsuarioId debe ser válido.", nameof(request.UsuarioId));
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(request.Titulo);
        ArgumentException.ThrowIfNullOrWhiteSpace(request.Mensaje);

        var notificacion = new Notificacion
        {
            UsuarioId = request.UsuarioId,
            Titulo = request.Titulo.Trim(),
            Mensaje = request.Mensaje.Trim(),
            Tipo = request.Tipo.ToString(),
            Modulo = request.Modulo,
            EntidadTipo = request.EntidadTipo,
            EntidadId = request.EntidadId,
            Url = request.Url,
            Leida = false,
            FechaLectura = null
        };

        dbContext.Notificaciones.Add(notificacion);

        await dbContext.SaveChangesAsync(cancellationToken);
        var response = Map(notificacion);
        await hubContext.Clients
            .Group($"usuario:{request.UsuarioId}")
            .SendAsync("NotificacionRecibida", response, cancellationToken);

        return response;
    }

    public async Task<IReadOnlyList<NotificacionResponse>> ListarAsync(
            int usuarioId,
            int cantidad = 20,
            CancellationToken cancellationToken = default)
    {
        if (usuarioId <= 0)
        {
            throw new ArgumentException("El UsuarioId debe ser válido.", nameof(usuarioId));
        }

        cantidad = Math.Clamp(cantidad, 1, 100);

        var notificaciones =
            await dbContext
                .Notificaciones
                .AsNoTracking()
                .Where(x => x.UsuarioId == usuarioId)
                .OrderByDescending(x => x.FechaCreacion)
                .Take(cantidad)
                .ToListAsync(cancellationToken);

        return notificaciones
            .Select(Map)
            .ToList();
    }

    public Task<int> ObtenerCantidadNoLeidasAsync(
        int usuarioId,
        CancellationToken cancellationToken = default)
    {
        if (usuarioId <= 0)
        {
            throw new ArgumentException(
                "El UsuarioId debe ser válido.",
                nameof(usuarioId));
        }

        return dbContext
            .Notificaciones
            .AsNoTracking()
            .CountAsync(x => x.UsuarioId == usuarioId && !x.Leida, cancellationToken);
    }

    public async Task MarcarComoLeidaAsync(
        int id,
        int usuarioId,
        CancellationToken cancellationToken = default)
    {
        if (usuarioId <= 0)
        {
            throw new ArgumentException("El UsuarioId debe ser válido.", nameof(usuarioId));
        }

        var notificacion = await dbContext.Notificaciones.FirstOrDefaultAsync(
            x => x.Id == id && x.UsuarioId == usuarioId, cancellationToken);

        if (notificacion is null)
        {
            throw new KeyNotFoundException($"No se encontró la notificación {id}.");
        }

        if (notificacion.Leida)
        {
            return;
        }

        notificacion.Leida = true;
        notificacion.FechaLectura = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await hubContext.Clients
            .Group($"usuario:{usuarioId}")
            .SendAsync("NotificacionLeida", id, cancellationToken);
    }

    public async Task MarcarTodasComoLeidasAsync(int usuarioId, CancellationToken cancellationToken = default)
    {
        if (usuarioId <= 0)
        {
            throw new ArgumentException(
                "El UsuarioId debe ser válido.",
                nameof(usuarioId));
        }

        var fechaLectura = DateTime.UtcNow;
        await dbContext.Notificaciones.Where(x => x.UsuarioId == usuarioId && !x.Leida)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(x => x.Leida, true)
                    .SetProperty(x => x.FechaLectura, fechaLectura),
                cancellationToken);

        await hubContext.Clients
            .Group($"usuario:{usuarioId}")
            .SendAsync("TodasNotificacionesLeidas", cancellationToken);
    }

    private static NotificacionResponse Map(Notificacion notificacion)
    {
        return new NotificacionResponse
        {
            Id = notificacion.Id,
            Titulo = notificacion.Titulo,
            Mensaje = notificacion.Mensaje,
            Tipo = Enum.TryParse<TipoNotificacion>(notificacion.Tipo, true, out var tipoEnum)
                ? tipoEnum
                : TipoNotificacion.Informacion,
            Modulo = notificacion.Modulo,
            EntidadTipo = notificacion.EntidadTipo,
            EntidadId = notificacion.EntidadId,
            Url = notificacion.Url,
            Leida = notificacion.Leida,
            FechaLectura = notificacion.FechaLectura,
            FechaCreacion = notificacion.FechaCreacion
        };
    }
}