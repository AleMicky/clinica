using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.Banco.Mappers;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using BancoEntity = Clinica.Api.Modules.Parametros.Banco.Entity.Banco;
using CuentaBancariaEntity = Clinica.Api.Modules.Parametros.Banco.Entity.CuentaBancaria;

namespace Clinica.Api.Modules.Parametros.Banco.Services;

public sealed class CuentaBancariaService(AppDbContext dbContext)
{
    public async Task<PagedResult<CuentaBancariaResponse>> ListarAsync(
        int bancoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureBancoExistsAsync(bancoId, cancellationToken);

        var query = dbContext.CuentasBancarias
            .AsNoTracking()
            .Where(x => x.BancoId == bancoId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.NumeroCuenta.Contains(normalizedSearch) ||
                (x.NombreCuenta != null &&
                 x.NombreCuenta.Contains(normalizedSearch)));
        }

        var totalItems = await query.CountAsync(
            cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.NumeroCuenta)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = CuentaBancariaMapper.ToResponse(entities);

        return new PagedResult<CuentaBancariaResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<CuentaBancariaResponse> ObtenerAsync(
        int bancoId,
        int cuentaId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBancoExistsAsync(bancoId, cancellationToken);

        var entity = await dbContext.CuentasBancarias
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.BancoId == bancoId
                     && x.Id == cuentaId
                     && x.Activo,
                cancellationToken);

        return entity is null
            ? throw new NotFoundException(
                nameof(CuentaBancariaEntity),
                cuentaId)
            : CuentaBancariaMapper.ToResponse(entity);
    }

    public async Task<CuentaBancariaResponse> CrearAsync(
        int bancoId,
        CreateCuentaBancariaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureBancoExistsAsync(bancoId, cancellationToken);

        await EnsureMonedaExistsAsync(
            request.MonedaId,
            cancellationToken);

        var numeroCuenta = request.NumeroCuenta.Trim();

        await ValidarUnicidadAsync(
            numeroCuenta,
            null,
            cancellationToken);

        var entity = CuentaBancariaMapper.ToEntity(request);

        entity.BancoId = bancoId;
        entity.Activo = true;

        Normalizar(entity);

        await dbContext.CuentasBancarias.AddAsync(
            entity,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(
            bancoId,
            entity.Id,
            cancellationToken);
    }

    public async Task<CuentaBancariaResponse> ActualizarAsync(
        int bancoId,
        int cuentaId,
        UpdateCuentaBancariaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureBancoExistsAsync(bancoId, cancellationToken);

        var entity = await dbContext.CuentasBancarias
            .FirstOrDefaultAsync(
                x => x.BancoId == bancoId
                     && x.Id == cuentaId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(CuentaBancariaEntity),
                cuentaId);
        }

        await EnsureMonedaExistsAsync(
            request.MonedaId,
            cancellationToken);

        var numeroCuenta = request.NumeroCuenta.Trim();

        await ValidarUnicidadAsync(
            numeroCuenta,
            cuentaId,
            cancellationToken);

        CuentaBancariaMapper.UpdateEntity(
            request,
            entity);

        Normalizar(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(
            bancoId,
            cuentaId,
            cancellationToken);
    }

    public async Task EliminarAsync(
        int bancoId,
        int cuentaId,
        CancellationToken cancellationToken = default)
    {
        await EnsureBancoExistsAsync(bancoId, cancellationToken);

        var entity = await dbContext.CuentasBancarias
            .FirstOrDefaultAsync(
                x => x.BancoId == bancoId
                     && x.Id == cuentaId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(CuentaBancariaEntity),
                cuentaId);
        }

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureBancoExistsAsync(
        int bancoId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Bancos
            .AnyAsync(x => x.Id == bancoId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(BancoEntity), bancoId);
    }

    private async Task EnsureMonedaExistsAsync(
        int monedaId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Monedas
            .AnyAsync(x => x.Id == monedaId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Moneda), monedaId);
    }

    private async Task ValidarUnicidadAsync(
        string numeroCuenta,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existe = excludeId is null
            ? await dbContext.CuentasBancarias.AnyAsync(
                x => x.NumeroCuenta == numeroCuenta,
                cancellationToken)
            : await dbContext.CuentasBancarias.AnyAsync(
                x => x.NumeroCuenta == numeroCuenta &&
                     x.Id != excludeId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una cuenta bancaria con el número '{numeroCuenta}'.");
        }
    }

    private static void Normalizar(CuentaBancariaEntity entity)
    {
        entity.NumeroCuenta = entity.NumeroCuenta.Trim();
        entity.NombreCuenta = Limpiar(entity.NombreCuenta);
        entity.TipoCuenta = Limpiar(entity.TipoCuenta);
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
