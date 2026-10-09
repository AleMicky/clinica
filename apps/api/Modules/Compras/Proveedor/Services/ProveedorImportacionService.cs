using System.ComponentModel.DataAnnotations;
using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;

namespace Clinica.Api.Modules.Compras.Proveedor.Services;

public sealed class ProveedorImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IProveedorImportacionService
{
    private static readonly EmailAddressAttribute EmailValidator = new();

    public async Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default)
    {
        var filas = excelReader.Read(archivo);

        var resultado = new ExcelImportResult
        {
            Total = filas.Count
        };

        if (filas.Count == 0)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 0,
                Column = null,
                Value = null,
                Message = "El archivo Excel no contiene registros."
            });

            return resultado;
        }

        ValidarColumnas(filas, resultado);

        if (resultado.Errors.Count > 0)
            return resultado;

        // 1. Extraer códigos y NITs únicos del Excel para consultas por lote
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(ObtenerValorColumna(x, "CODIGO", "CODIGO_PROVEEDOR")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var nitsExcel = filas
            .Select(x => NormalizarTexto(ObtenerValorColumna(x, "NIT", "RUC", "DOCUMENTO", "NUMERO_DOCUMENTO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 2. Consultar registros existentes en BD
        var codigosExistentesDb = await dbContext.Proveedores
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .Select(x => x.Codigo)
            .ToListAsync(cancellationToken);

        var codigosExistentesSet = codigosExistentesDb.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var nitsExistentesDb = nitsExcel.Count > 0
            ? await dbContext.Proveedores
                .AsNoTracking()
                .Where(x => x.Nit != null && nitsExcel.Contains(x.Nit))
                .Select(x => x.Nit!)
                .ToListAsync(cancellationToken)
            : [];

        var nitsExistentesSet = nitsExistentesDb.ToHashSet(StringComparer.OrdinalIgnoreCase);

        // 3. Estructuras de seguimiento durante el procesamiento
        var codigosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var nitsProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var proveedoresNuevos = new List<ProveedorEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                proveedoresNuevos,
                codigosExistentesSet,
                nitsExistentesSet,
                codigosProcesados,
                nitsProcesados,
                resultado);
        }

        if (proveedoresNuevos.Count == 0)
            return resultado;

        // 4. Persistir nuevos proveedores
        await dbContext.Proveedores.AddRangeAsync(proveedoresNuevos, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = proveedoresNuevos.Count;

        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<ProveedorEntity> proveedoresNuevos,
        HashSet<string> codigosExistentesSet,
        HashSet<string> nitsExistentesSet,
        HashSet<string> codigosProcesados,
        HashSet<string> nitsProcesados,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        var codigo = NormalizarCodigo(ObtenerValorColumna(fila, "CODIGO", "CODIGO_PROVEEDOR"));
        var razonSocial = NormalizarTexto(ObtenerValorColumna(fila, "RAZON_SOCIAL", "RAZON SOCIAL", "NOMBRE"));
        var nombreComercial = NormalizarTexto(ObtenerValorColumna(fila, "NOMBRE_COMERCIAL", "NOMBRE COMERCIAL"));
        var nit = NormalizarTexto(ObtenerValorColumna(fila, "NIT", "RUC", "DOCUMENTO", "NUMERO_DOCUMENTO"));
        var direccion = NormalizarTexto(ObtenerValorColumna(fila, "DIRECCION"));
        var telefono = NormalizarTexto(ObtenerValorColumna(fila, "TELEFONO"));
        var celular = NormalizarTexto(ObtenerValorColumna(fila, "CELULAR"));
        var email = NormalizarTexto(ObtenerValorColumna(fila, "EMAIL", "CORREO", "CORREO_ELECTRONICO"));
        var contacto = NormalizarTexto(ObtenerValorColumna(fila, "CONTACTO", "PERSONA_CONTACTO"));
        var observacion = NormalizarTexto(ObtenerValorColumna(fila, "OBSERVACION", "OBSERVACIONES"));

        // Validación: CODIGO
        if (string.IsNullOrWhiteSpace(codigo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código del proveedor es obligatorio.");
            tieneError = true;
        }
        else if (codigo.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código no puede superar los 20 caracteres.");
            tieneError = true;
        }
        else
        {
            // Duplicado dentro del mismo archivo Excel
            if (!codigosProcesados.Add(codigo))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"El código '{codigo}' está duplicado dentro del archivo Excel.");
                tieneError = true;
            }

            // Ya existe en la base de datos
            if (codigosExistentesSet.Contains(codigo))
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"Ya existe un proveedor registrado con el código '{codigo}' en la base de datos.");
                tieneError = true;
            }
        }

        // Validación: RAZON_SOCIAL
        if (string.IsNullOrWhiteSpace(razonSocial))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "RAZON_SOCIAL",
                razonSocial,
                "La razón social es obligatoria.");
            tieneError = true;
        }
        else if (razonSocial.Length > 150)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "RAZON_SOCIAL",
                razonSocial,
                "La razón social no puede superar los 150 caracteres.");
            tieneError = true;
        }

        // Validación: NOMBRE_COMERCIAL (Opcional)
        if (!string.IsNullOrWhiteSpace(nombreComercial) && nombreComercial.Length > 150)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE_COMERCIAL",
                nombreComercial,
                "El nombre comercial no puede superar los 150 caracteres.");
            tieneError = true;
        }

        // Validación: NIT (Opcional pero único)
        if (!string.IsNullOrWhiteSpace(nit))
        {
            if (nit.Length > 20)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "NIT",
                    nit,
                    "El NIT no puede superar los 20 caracteres.");
                tieneError = true;
            }
            else
            {
                // Duplicado dentro del mismo archivo Excel
                if (!nitsProcesados.Add(nit))
                {
                    AgregarError(
                        resultado,
                        fila.RowNumber,
                        "NIT",
                        nit,
                        $"El NIT '{nit}' está duplicado dentro del archivo Excel.");
                    tieneError = true;
                }

                // Ya existe en la base de datos
                if (nitsExistentesSet.Contains(nit))
                {
                    resultado.Omitidos++;
                    AgregarError(
                        resultado,
                        fila.RowNumber,
                        "NIT",
                        nit,
                        $"Ya existe un proveedor registrado con el NIT '{nit}' en la base de datos.");
                    tieneError = true;
                }
            }
        }

        // Validación: DIRECCION (Opcional)
        if (!string.IsNullOrWhiteSpace(direccion) && direccion.Length > 250)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "DIRECCION",
                direccion,
                "La dirección no puede superar los 250 caracteres.");
            tieneError = true;
        }

        // Validación: TELEFONO (Opcional)
        if (!string.IsNullOrWhiteSpace(telefono) && telefono.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "TELEFONO",
                telefono,
                "El teléfono no puede superar los 20 caracteres.");
            tieneError = true;
        }

        // Validación: CELULAR (Opcional)
        if (!string.IsNullOrWhiteSpace(celular) && celular.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CELULAR",
                celular,
                "El celular no puede superar los 20 caracteres.");
            tieneError = true;
        }

        // Validación: EMAIL (Opcional)
        if (!string.IsNullOrWhiteSpace(email))
        {
            if (email.Length > 100)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "EMAIL",
                    email,
                    "El correo electrónico no puede superar los 100 caracteres.");
                tieneError = true;
            }
            else if (!EmailValidator.IsValid(email))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "EMAIL",
                    email,
                    "El correo electrónico no tiene un formato válido.");
                tieneError = true;
            }
        }

        // Validación: CONTACTO (Opcional)
        if (!string.IsNullOrWhiteSpace(contacto) && contacto.Length > 100)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CONTACTO",
                contacto,
                "El contacto no puede superar los 100 caracteres.");
            tieneError = true;
        }

        // Validación: OBSERVACION (Opcional)
        if (!string.IsNullOrWhiteSpace(observacion) && observacion.Length > 500)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "OBSERVACION",
                observacion,
                "La observación no puede superar los 500 caracteres.");
            tieneError = true;
        }

        if (tieneError)
            return;

        proveedoresNuevos.Add(new ProveedorEntity
        {
            Codigo = codigo!,
            RazonSocial = razonSocial!,
            NombreComercial = nombreComercial,
            Nit = nit,
            Direccion = direccion,
            Telefono = telefono,
            Celular = celular,
            Email = email,
            Contacto = contacto,
            Observacion = observacion,
            Activo = true
        });
    }

    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        // Validar columna CODIGO
        if (!TieneColumna(primeraFila, "CODIGO", "CODIGO_PROVEEDOR"))
        {
            AgregarError(
                resultado,
                1,
                "CODIGO",
                null,
                "No se encontró la columna obligatoria 'CODIGO' en el archivo Excel.");
        }

        // Validar columna RAZON_SOCIAL
        if (!TieneColumna(primeraFila, "RAZON_SOCIAL", "RAZON SOCIAL", "NOMBRE"))
        {
            AgregarError(
                resultado,
                1,
                "RAZON_SOCIAL",
                null,
                "No se encontró la columna obligatoria 'RAZON_SOCIAL' en el archivo Excel.");
        }
    }

    private static bool TieneColumna(ExcelRow fila, params string[] nombres)
    {
        return nombres.Any(n => fila.Values.ContainsKey(n));
    }

    private static string? ObtenerValorColumna(ExcelRow fila, params string[] nombres)
    {
        foreach (var nombre in nombres)
        {
            var valor = fila.Get(nombre);
            if (valor != null)
                return valor;
        }

        return null;
    }

    private static string? NormalizarCodigo(string? codigo)
    {
        if (string.IsNullOrWhiteSpace(codigo))
            return null;

        return codigo.Trim().ToUpperInvariant();
    }

    private static string? NormalizarTexto(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        return valor.Trim();
    }

    private static void AgregarError(
        ExcelImportResult resultado,
        int fila,
        string columna,
        string? valor,
        string mensaje)
    {
        resultado.Errors.Add(new ExcelImportError
        {
            Row = fila,
            Column = columna,
            Value = valor,
            Message = mensaje
        });
    }
}
