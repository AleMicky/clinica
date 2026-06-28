namespace Clinica.Modules.AtencionMedica.Application.SignosVitales;

public sealed record SignoVitalResponse(
    Guid Id,
    Guid AtencionId,
    decimal? Temperatura,
    int? FrecuenciaCardiaca,
    int? FrecuenciaRespiratoria,
    int? PresionSistolica,
    int? PresionDiastolica,
    decimal? SaturacionOxigeno,
    decimal? GlucemiaCapilar,
    decimal? Peso,
    decimal? Talla,
    decimal? Imc,
    int? Glasgow,
    DateTime FechaRegistro);

public sealed record CreateSignoVitalRequest(
    Guid AtencionId,
    decimal? Temperatura = null,
    int? FrecuenciaCardiaca = null,
    int? FrecuenciaRespiratoria = null,
    int? PresionSistolica = null,
    int? PresionDiastolica = null,
    decimal? SaturacionOxigeno = null,
    decimal? GlucemiaCapilar = null,
    decimal? Peso = null,
    decimal? Talla = null,
    decimal? Imc = null,
    int? Glasgow = null,
    DateTime? FechaRegistro = null);

public sealed record UpdateSignoVitalRequest(
    Guid AtencionId,
    decimal? Temperatura = null,
    int? FrecuenciaCardiaca = null,
    int? FrecuenciaRespiratoria = null,
    int? PresionSistolica = null,
    int? PresionDiastolica = null,
    decimal? SaturacionOxigeno = null,
    decimal? GlucemiaCapilar = null,
    decimal? Peso = null,
    decimal? Talla = null,
    decimal? Imc = null,
    int? Glasgow = null,
    DateTime? FechaRegistro = null);
