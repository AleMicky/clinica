using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Data.Seed;

public static class RecursosHumanosSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var tiposPorCodigo = await SembrarTiposAreaAsync(dbContext);
        await SembrarAreasAsync(dbContext, tiposPorCodigo);
        await SembrarCargosAsync(dbContext);
        await SembrarEmpleadosAsync(dbContext);
    }

    private static async Task<Dictionary<string, TipoArea>> SembrarTiposAreaAsync(
        AppDbContext dbContext)
    {
        var seedTipos = BuildSeedTiposArea();

        var codigos = seedTipos.Select(t => t.Codigo).ToArray();

        var existentes = await dbContext.TiposArea
            .Where(t => codigos.Contains(t.Codigo))
            .ToListAsync();

        var porCodigo = existentes
            .ToDictionary(t => t.Codigo, StringComparer.OrdinalIgnoreCase);

        var faltaGuardar = false;

        foreach (var seed in seedTipos)
        {
            if (!porCodigo.ContainsKey(seed.Codigo))
            {
                var tipo = new TipoArea
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Orden = seed.Orden,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                dbContext.TiposArea.Add(tipo);
                porCodigo[seed.Codigo] = tipo;
                faltaGuardar = true;
            }
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }

        return porCodigo;
    }

    private static List<SeedTipoArea> BuildSeedTiposArea()
    {
        return
        [
            new SeedTipoArea(
                "AREA",
                "Área",
                "Nivel organizacional principal de la institución.",
                1),
            new SeedTipoArea(
                "DEPARTAMENTO",
                "Departamento",
                "División funcional que pertenece a un área.",
                2),
            new SeedTipoArea(
                "SERVICIO",
                "Servicio",
                "Unidad operativa que pertenece a un departamento.",
                3),
            new SeedTipoArea(
                "CARGO",
                "Cargo",
                "Puesto o función asignada al personal dentro de un servicio.",
                4)
        ];
    }

    private static async Task SembrarAreasAsync(
        AppDbContext dbContext,
        Dictionary<string, TipoArea> tiposPorCodigo)
    {
        var seedAreas = BuildSeedAreas();

        var todasCodigos = seedAreas.Select(a => a.Codigo).ToArray();

        var existentes = await dbContext.Areas
            .Where(a => todasCodigos.Contains(a.Codigo))
            .ToListAsync();

        var existentesPorCodigo = existentes
            .ToDictionary(a => a.Codigo, StringComparer.OrdinalIgnoreCase);

        var ahora = DateTime.UtcNow;

        var pendientes = seedAreas
            .Where(s => !existentesPorCodigo.ContainsKey(s.Codigo))
            .ToList();

        var creadasPorCodigo = new Dictionary<string, Area>(
            StringComparer.OrdinalIgnoreCase);

        foreach (var existente in existentes)
        {
            creadasPorCodigo[existente.Codigo] = existente;
        }

        var raices = pendientes.Where(a => a.CodigoPadre is null).ToList();
        var restantes = pendientes.Where(a => a.CodigoPadre is not null).ToList();

        foreach (var seed in raices)
        {
            var tipoArea = tiposPorCodigo[seed.TipoAreaCodigo];

            var area = new Area
            {
                Codigo = seed.Codigo,
                Nombre = seed.Nombre,
                Descripcion = seed.Descripcion,
                Orden = seed.Orden,
                TipoAreaId = tipoArea.Id,
                Activo = true,
                FechaCreacion = ahora
            };

            dbContext.Areas.Add(area);
            creadasPorCodigo[seed.Codigo] = area;
        }

        await dbContext.SaveChangesAsync();

        while (restantes.Count > 0)
        {
            var procesadas = new List<SeedArea>();

            foreach (var seed in restantes)
            {
                if (!creadasPorCodigo.TryGetValue(seed.CodigoPadre!, out var padre))
                {
                    continue;
                }

                if (padre.Id == 0)
                {
                    continue;
                }

                var tipoArea = tiposPorCodigo[seed.TipoAreaCodigo];

                var area = new Area
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Orden = seed.Orden,
                    TipoAreaId = tipoArea.Id,
                    AreaPadreId = padre.Id,
                    Activo = true,
                    FechaCreacion = ahora
                };

                dbContext.Areas.Add(area);
                creadasPorCodigo[seed.Codigo] = area;
                procesadas.Add(seed);
            }

            await dbContext.SaveChangesAsync();
            restantes.RemoveAll(s => procesadas.Contains(s));
        }
    }

    private static List<SeedArea> BuildSeedAreas()
    {
        return
        [
            new SeedArea("ADMINISTRATIVA", "Administrativa", "Área responsable de la gestión administrativa y operativa de la institución.", "AREA", null, 1),
            new SeedArea("ATENCION_SALUD", "Atención en Salud", "Área responsable de la atención médica y asistencial.", "AREA", null, 2),

            new SeedArea("ADMINISTRATIVO", "Administrativo", "Departamento encargado de la administración institucional.", "DEPARTAMENTO", "ADMINISTRATIVA", 1),
            new SeedArea("ATENCION_CLIENTE", "Atención al Cliente", "Departamento encargado de la atención y orientación al cliente.", "DEPARTAMENTO", "ADMINISTRATIVA", 2),
            new SeedArea("DIRECCION", "Dirección", "Departamento encargado de la dirección institucional.", "DEPARTAMENTO", "ADMINISTRATIVA", 3),
            new SeedArea("ESTADISTICA", "Estadística", "Departamento encargado de información, estadísticas y archivos.", "DEPARTAMENTO", "ADMINISTRATIVA", 4),
            new SeedArea("FINANCIERO", "Financiero", "Departamento encargado de la gestión financiera y contable.", "DEPARTAMENTO", "ADMINISTRATIVA", 5),
            new SeedArea("SERVICIOS_GENERALES", "Servicios Generales", "Departamento encargado de los servicios operativos generales.", "DEPARTAMENTO", "ADMINISTRATIVA", 6),

            new SeedArea("APOYO_DIAGNOSTICO_TRATAMIENTO", "Apoyo de Diagnóstico y Tratamiento", "Departamento encargado de los servicios auxiliares de diagnóstico y tratamiento.", "DEPARTAMENTO", "ATENCION_SALUD", 1),
            new SeedArea("ENFERMERIA", "Enfermería", "Departamento encargado de los servicios de enfermería.", "DEPARTAMENTO", "ATENCION_SALUD", 2),
            new SeedArea("MEDICO_ASISTENCIAL", "Médico Asistencial", "Departamento encargado de la atención médica asistencial.", "DEPARTAMENTO", "ATENCION_SALUD", 3),

            new SeedArea("SERV_ADMINISTRATIVO", "Administrativo", "Servicio de gestión administrativa.", "SERVICIO", "ADMINISTRATIVO", 1),
            new SeedArea("SERV_RECEPCION", "Recepción", "Servicio encargado de recibir y orientar a los usuarios.", "SERVICIO", "ATENCION_CLIENTE", 1),
            new SeedArea("SERV_DIRECCION_ADMINISTRATIVA", "Administrativo", "Servicio administrativo dependiente de Dirección.", "SERVICIO", "DIRECCION", 1),
            new SeedArea("SERV_ARCHIVOS", "Archivos", "Servicio encargado de la organización y custodia de archivos.", "SERVICIO", "ESTADISTICA", 1),
            new SeedArea("SERV_INFORMACION", "Información", "Servicio encargado de la información y los registros estadísticos.", "SERVICIO", "ESTADISTICA", 2),
            new SeedArea("SERV_CONTABILIDAD", "Contabilidad", "Servicio responsable de la gestión contable.", "SERVICIO", "FINANCIERO", 1),
            new SeedArea("SERV_COCINA", "Cocina", "Servicio responsable de cocina y alimentación.", "SERVICIO", "SERVICIOS_GENERALES", 1),
            new SeedArea("SERV_LAVANDERIA_PLANCHADO", "Lavandería y Planchado", "Servicio responsable del lavado y planchado de ropa institucional.", "SERVICIO", "SERVICIOS_GENERALES", 2),
            new SeedArea("SERV_LIMPIEZA", "Limpieza", "Servicio responsable de la limpieza institucional.", "SERVICIO", "SERVICIOS_GENERALES", 3),
            new SeedArea("SERV_MANTENIMIENTO", "Mantenimiento", "Servicio responsable del mantenimiento de infraestructura y equipos.", "SERVICIO", "SERVICIOS_GENERALES", 4),
            new SeedArea("SERV_ROPERIA", "Ropería", "Servicio responsable de la gestión de ropa institucional.", "SERVICIO", "SERVICIOS_GENERALES", 5),
            new SeedArea("SERV_SEGURIDAD", "Seguridad", "Servicio responsable de seguridad y portería.", "SERVICIO", "SERVICIOS_GENERALES", 6),
            new SeedArea("SERV_ECOGRAFIA", "Ecografía", "Servicio de diagnóstico mediante ecografía.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 1),
            new SeedArea("SERV_FARMACIA", "Farmacia", "Servicio responsable de medicamentos e insumos farmacéuticos.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 2),
            new SeedArea("SERV_LABORATORIO", "Laboratorio", "Servicio responsable de análisis clínicos.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 3),
            new SeedArea("SERV_NUTRICION", "Nutrición", "Servicio responsable de la evaluación y atención nutricional.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 4),
            new SeedArea("SERV_RAYOS_X", "Rayos X", "Servicio de diagnóstico radiológico.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 5),
            new SeedArea("SERV_TRANSFUSIONAL", "Servicio Transfusional", "Servicio responsable de los procedimientos transfusionales.", "SERVICIO", "APOYO_DIAGNOSTICO_TRATAMIENTO", 6),
            new SeedArea("SERV_AUXILIARES_ENFERMERIA", "Auxiliares en Enfermería", "Servicio integrado por personal auxiliar de enfermería.", "SERVICIO", "ENFERMERIA", 1),
            new SeedArea("SERV_JEFATURA_ENFERMERIA", "Jefatura", "Servicio responsable de la coordinación y supervisión de enfermería.", "SERVICIO", "ENFERMERIA", 2),
            new SeedArea("SERV_LICENCIADOS_ENFERMERIA", "Licenciados en Enfermería", "Servicio integrado por profesionales licenciados en enfermería.", "SERVICIO", "ENFERMERIA", 3),
            new SeedArea("SERV_TECNICO_ENFERMERIA", "Técnico en Enfermería", "Servicio integrado por personal técnico en enfermería.", "SERVICIO", "ENFERMERIA", 4),
            new SeedArea("SERV_TECNICO_MEDIO_ENFERMERIA", "Técnico Medio en Enfermería", "Servicio integrado por personal técnico medio en enfermería.", "SERVICIO", "ENFERMERIA", 5),
            new SeedArea("SERV_CONSULTA_EXTERNA", "Consulta Externa", "Servicio de atención médica ambulatoria.", "SERVICIO", "MEDICO_ASISTENCIAL", 1),
            new SeedArea("SERV_MEDICO_GUARDIA", "Médico de Guardia", "Servicio de atención médica de guardia.", "SERVICIO", "MEDICO_ASISTENCIAL", 2),
            new SeedArea("SERV_QUIROFANO", "Quirófano", "Servicio destinado a procedimientos quirúrgicos.", "SERVICIO", "MEDICO_ASISTENCIAL", 3)
        ];
    }

    private static async Task SembrarCargosAsync(AppDbContext dbContext)
    {
        var seedCargos = BuildSeedCargos();

        var codigos = seedCargos.Select(c => c.Codigo).ToArray();

        var existentes = await dbContext.Cargos
            .Where(c => codigos.Contains(c.Codigo))
            .ToListAsync();

        var existentesPorCodigo = existentes
            .ToDictionary(c => c.Codigo, StringComparer.OrdinalIgnoreCase);

        var faltaGuardar = false;
        var ahora = DateTime.UtcNow;

        foreach (var seed in seedCargos)
        {
            if (!existentesPorCodigo.ContainsKey(seed.Codigo))
            {
                dbContext.Cargos.Add(new Cargo
                {
                    Codigo = seed.Codigo,
                    Nombre = seed.Nombre,
                    Descripcion = seed.Descripcion,
                    Activo = true,
                    FechaCreacion = ahora
                });
                faltaGuardar = true;
            }
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static List<SeedCargo> BuildSeedCargos()
    {
        var nombres = new[]
        {
            "Administradora",
            "Anestesiología",
            "Anestesiólogo",
            "Archivista",
            "Auxiliar administrativa",
            "Auxiliar administrativa de caja",
            "Auxiliar de caja y seguros",
            "Auxiliar de enfermería",
            "Auxiliar de enfermería de apoyo",
            "Auxiliar de farmacia",
            "Auxiliar de laboratorio",
            "Auxiliar de marketing y admisión",
            "Ayudante de cocina",
            "Ayudante de lavado",
            "Ayudante de limpieza",
            "Cajas",
            "Cajas y tesorería",
            "Cajera",
            "Cardiología",
            "Circulante",
            "Cirugía general",
            "Cirugía plástica",
            "Colposcopia",
            "Contador",
            "Director general",
            "Director médico",
            "Ecografista",
            "Encargada de cocina",
            "Encargada de costura",
            "Encargada de esterilización",
            "Encargada de limpieza",
            "Encargada de neonatología",
            "Encargada de planchado",
            "Encargada de quirófano",
            "Encargada de UTI",
            "Encargado de mantenimiento",
            "Encargado de rayos X",
            "Encargado de servicio",
            "Enfermera de base",
            "Enfermera de emergencias",
            "Enfermera de esterilización",
            "Enfermera de quirófano",
            "Enfermera de servicio crítico",
            "Enfermero de base",
            "Enfermero de salas de internación",
            "Estadígrafo",
            "Esterilización",
            "Farmacia",
            "Gastroenterología",
            "Gerente administrativo financiero",
            "Geriatría",
            "Ginecología",
            "Guardia de seguridad/portero",
            "Instrumentista",
            "Instrumentista quirúrgica",
            "Jefa de enfermeras",
            "Jefe de enfermería",
            "Laboratorios",
            "Lavado y planchado",
            "Limpieza",
            "Marketing",
            "Medicina crítica y terapia intensiva",
            "Medicina interna",
            "Médico",
            "Médico de guardia",
            "Otorrinolaringología",
            "Pediatría",
            "Personal de esterilización",
            "Planchado",
            "Psiquiatra",
            "Psiquiatría",
            "Quirófano",
            "Radiólogo",
            "Recepcionista",
            "Regente de farmacia",
            "Responsable",
            "Responsable de esterilización",
            "Responsable de quirófano",
            "Supervisora de enfermería",
            "Técnica en rayos X",
            "Terapia intensiva",
            "Traumatología",
            "Traumatólogo",
            "Urólogo",
            "Ayudante de enfermería"
        };

        return nombres
            .Select((nombre, i) => new SeedCargo(
                $"C{(i + 1):000}",
                nombre,
                null))
            .ToList();
    }

    private static async Task SembrarEmpleadosAsync(AppDbContext dbContext)
    {
        var seedEmpleados = BuildSeedEmpleados();

        var cargosPorCodigo = await dbContext.Cargos
            .ToDictionaryAsync(c => c.Codigo, StringComparer.OrdinalIgnoreCase);

        var areasPorCodigo = await dbContext.Areas
            .ToDictionaryAsync(a => a.Codigo, StringComparer.OrdinalIgnoreCase);

        var grupos = seedEmpleados
            .GroupBy(e => $"{e.Paterno.Trim().ToUpperInvariant()}|{(e.Materno ?? "").Trim().ToUpperInvariant()}|{e.Nombres.Trim().ToUpperInvariant()}")
            .ToList();

        var docPrefix = "90000";
        var ahora = DateTime.UtcNow;
        var fechaInicio = DateOnly.FromDateTime(DateTime.UtcNow);

        var docs = grupos.Select((_, i) => $"{docPrefix}{i + 1:000}").ToList();
        var existentesPersonas = await dbContext.Personas
            .Where(p => docs.Contains(p.NumeroDocumento))
            .ToListAsync();

        var personasPorDoc = existentesPersonas
            .ToDictionary(p => p.NumeroDocumento, StringComparer.OrdinalIgnoreCase);

        var empleadosPorDoc = new Dictionary<string, Empleado>(StringComparer.OrdinalIgnoreCase);

        if (existentesPersonas.Count > 0)
        {
            var personaIds = existentesPersonas.Select(p => p.Id).ToList();
            var empleadosExistentes = await dbContext.Empleados
                .Where(e => personaIds.Contains(e.PersonaId))
                .ToListAsync();
            foreach (var emp in empleadosExistentes)
            {
                var persona = existentesPersonas.First(p => p.Id == emp.PersonaId);
                empleadosPorDoc[persona.NumeroDocumento] = emp;
            }
        }

        var faltaGuardar = false;

        foreach (var grupo in grupos.Select((g, i) => new { g, doc = docs[i] }))
        {
            if (!personasPorDoc.TryGetValue(grupo.doc, out var persona))
            {
                var first = grupo.g.First();

                persona = new Persona
                {
                    Nombres = first.Nombres.Trim(),
                    ApellidoPaterno = first.Paterno.Trim(),
                    ApellidoMaterno = first.Materno?.Trim(),
                    FechaNacimiento = new DateOnly(1990, 1, 1),
                    TipoDocumento = "CI",
                    NumeroDocumento = grupo.doc,
                    Activo = true,
                    FechaCreacion = ahora
                };

                dbContext.Personas.Add(persona);
                await dbContext.SaveChangesAsync();

                personasPorDoc[grupo.doc] = persona;

                var empleado = new Empleado
                {
                    PersonaId = persona.Id,
                    Activo = true,
                    FechaCreacion = ahora
                };

                dbContext.Empleados.Add(empleado);
                await dbContext.SaveChangesAsync();

                empleado.CodigoEmpleado = $"CQ-{empleado.Id:D5}";
                await dbContext.SaveChangesAsync();

                empleadosPorDoc[grupo.doc] = empleado;
            }

            if (!empleadosPorDoc.TryGetValue(grupo.doc, out var emp))
            {
                continue;
            }

            foreach (var seed in grupo.g)
            {
                if (!cargosPorCodigo.TryGetValue(seed.CargoCodigo, out var cargo) ||
                    !areasPorCodigo.TryGetValue(seed.AreaCodigo, out var area))
                {
                    continue;
                }

                var yaExiste = await dbContext.AsignacionesEmpleado
                    .AnyAsync(a =>
                        a.EmpleadoId == emp.Id &&
                        a.CargoId == cargo.Id &&
                        a.AreaId == area.Id);

                if (yaExiste)
                {
                    continue;
                }

                dbContext.AsignacionesEmpleado.Add(new AsignacionEmpleado
                {
                    EmpleadoId = emp.Id,
                    CargoId = cargo.Id,
                    AreaId = area.Id,
                    FechaInicio = fechaInicio,
                    Activo = true,
                    FechaCreacion = ahora
                });

                faltaGuardar = true;
            }
        }

        if (faltaGuardar)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static List<SeedEmpleado> BuildSeedEmpleados()
    {
        return
        [
            new SeedEmpleado("Achá", "Aguilar", "Carlos Federico", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Ajarachi", "Mamani", "Elsa", "C031", "SERV_LIMPIEZA"),
            new SeedEmpleado("Ala", null, "Israel", "C083", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Antezana", "Caceres", "Claudia Lucia", "C005", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Antezana", "Siles", "Antonieta", "C005", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Aramayo", "Velasqez", "Mariel", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Aramayo", "Velasqez", "Mariel", "C042", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Aramayo", "Velasquez", "Mariel", "C034", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Arancibia", null, "Javier", "C084", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Arancibia", "Calizaya", "Miguel Angel", "C063", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Arce", "Morales", "Luis Antonio", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Argote", "Leaño", "Christian", "C063", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Aro", "Tumiri", "Lidia", "C076", "SERV_RAYOS_X"),
            new SeedEmpleado("Arratia", "Paco", "Victor Hugo", "C003", "SERV_QUIROFANO"),
            new SeedEmpleado("Arrieta", "Cornejo", "José Manuel", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Bacarreza", "Garcia", "Jhonny Eduardo", "C049", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Balboa", "Paco", "Corina Jimena", "C075", "SERV_FARMACIA"),
            new SeedEmpleado("Baldivieso", "Teran", "Nicole Lilian", "C067", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Baldiviezo", "Vargas", "Pablo Edmundo", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Baltazar", "Zanga", "Maria Elena", "C035", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Bellido", "Rios", "Shirley Damaris", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Beltran", "Guevara", "Jose arturo", "C026", "SERV_DIRECCION_ADMINISTRATIVA"),
            new SeedEmpleado("Beltrán", "Guevara", "José Arturo", "C026", "SERV_ADMINISTRATIVO"),
            new SeedEmpleado("Bonifaz", "Vicente", "Pedro", "C057", "SERV_JEFATURA_ENFERMERIA"),
            new SeedEmpleado("Cabello", "Marquez", "Rafael Dante", "C067", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Cabrerizo", "Torrico", "Luis Eduardo", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Cadiz", "Guzman", "Greyci Mariela", "C013", "SERV_COCINA"),
            new SeedEmpleado("Camacho", null, "Jhonny", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Camacho", "Tercaros", "Luis Alberto", "C082", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Camacho", "Terrazas", "Jorge Alberto", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Canaviri", "Mamani", "Silveria", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Canedo", "Saavedra", "Hernán Orlando", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Carpio", "Dehezza", "Gonzalo", "C051", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Carvajal", "Quenaya", "Modesta", "C068", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Carvajal", "Quenaya", "Modesta", "C030", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Cayo", "Benitez", "Lidia Ester", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Cayoja", "Romero", "Mayerlin", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Cespedes", "Ledezma", "Aleida Adriana", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Cespedes", "Vargas", "Juan", "C063", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Claros", null, "Angelica", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Colomi", "Plater", "Loyda Gabriela", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Concha", "Mariaca", "Nain Waldo", "C019", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Condori", "Rojas", "Eulalia", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Corani", "Mamani", "Aldo", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Corrales", "Vasquez", "Trifonia", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Cossio", "Vargas", "Celeste", "C015", "SERV_LIMPIEZA"),
            new SeedEmpleado("Cruz", null, "Harold", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Duran", "Berrios", "Juan Carlos", "C053", "SERV_SEGURIDAD"),
            new SeedEmpleado("Escalera", "Claros", "Orlando", "C082", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Escobar", "Lopez", "Maricela", "C066", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Escobar", "Vargas", "Daniela", "C049", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Espinoza", "Toco", "Eric Gonzalo", "C063", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Espinoza", "Zapata", "Nicolas", "C082", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Estevez", "Villa", "Daniel", "C022", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Fernandez", "Laura", "Maria Rene", "C032", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Fernandez", "Laura", "Micaela", "C035", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Fernandez", "Rodriguez", "Patricia", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Flores", null, "Sabina", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Flores", "Colque", "Vimar", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Flores", "Condori", "Maribel", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Flores", "Quispe", "Melisa", "C015", "SERV_LIMPIEZA"),
            new SeedEmpleado("FLORES", "QUISPE", "MELIZA", "C031", "SERV_LIMPIEZA"),
            new SeedEmpleado("Gamboa", null, "Mauricio", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Gomez", "Ferrufino", "Gabriela raquel", "C056", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Gomez", "Ferrufino", "Gabriela Raquel", "C056", "SERV_JEFATURA_ENFERMERIA"),
            new SeedEmpleado("GOMEZ", "FERRUFINO", "GABRIELA RAQUEL", "C057", "SERV_JEFATURA_ENFERMERIA"),
            new SeedEmpleado("Gonzales", "Cortez", "Rina", "C028", "SERV_COCINA"),
            new SeedEmpleado("Gonzales", "Salazar", "Wilder Ariel", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Guerra", null, "Alejandra", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Guerra", null, "Alejandra", "C027", "SERV_ECOGRAFIA"),
            new SeedEmpleado("Guerra", "Serrudo", "Alejandra Stephanie", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Guillen", "Sanchez", "Carlos", "C053", "SERV_SEGURIDAD"),
            new SeedEmpleado("Guillen", "Sanchez", "Carlos", "C004", "SERV_ARCHIVOS"),
            new SeedEmpleado("Gutierrez", null, "Raul", "C017", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Gutierrez", null, "Raul", "C016", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Gutierrez", "Amurrio", "Bernandina", "C013", "SERV_COCINA"),
            new SeedEmpleado("Hayashida", "Villaroel", "Elia Lizeth", "C074", "SERV_INFORMACION"),
            new SeedEmpleado("Hayashida**", "Villaroel", "Elia Lizeth", "C011", "SERV_TRANSFUSIONAL"),
            new SeedEmpleado("Hinojosa", "Guzman", "Amalia del Camen", "C029", "SERV_ROPERIA"),
            new SeedEmpleado("Huanca", "Velasco", "Filema", "C059", "SERV_ROPERIA"),
            new SeedEmpleado("Huarachi", "Carbajal", "Rosse Mary Aidee", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Illanes", "Villarroel", "Eldy", "C058", "SERV_LABORATORIO"),
            new SeedEmpleado("Inochea", "Rojas", "Mary", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Inturias", "Alvarado", "Wilder", "C084", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Juanes", null, "Rossmery", "C015", "SERV_LIMPIEZA"),
            new SeedEmpleado("Lopez", "Escalera", "Jimena Roxana", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Lopez", "Lopez", "Carlos", "C019", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Lopez", "Lopez", "Edgar", "C081", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Lopez", "Lopez", "Edgar Fernando", "C019", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Lopez", "Soliz", "Alejandra Isabel", "C074", "SERV_INFORMACION"),
            new SeedEmpleado("Lopez", "Soliz", "Alejandra Isabel", "C046", "SERV_ARCHIVOS"),
            new SeedEmpleado("Mamani", null, "Delfina", "C015", "SERV_LIMPIEZA"),
            new SeedEmpleado("Mamani", "Llampa", "Juana", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Mamani", "Quispia", "Griselda", "C075", "SERV_FARMACIA"),
            new SeedEmpleado("Mamani", "Quispia", "Griselda", "C048", "SERV_FARMACIA"),
            new SeedEmpleado("Marca", null, "Dania Marce", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Martinez", null, "Rudy", "C084", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Mercado", "Céspedes", "José Augusto", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Miranda", "Ayala", "Katherin Noelia", "C012", "SERV_RECEPCION"),
            new SeedEmpleado("Miranda", "Ayala", "Katherin Noelia", "C061", "SERV_INFORMACION"),
            new SeedEmpleado("Miranda", "Herrera", "Lilian Melina", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Molina", "Waquera", "Maria Rosa", "C015", "SERV_LIMPIEZA"),
            new SeedEmpleado("Montaño", "Gonzáles", "Manuel Eduardo", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Montoya", "Sandoval", "Katty", "C077", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Morales", "Paredes", "Maria Carolina", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Murillo", "Arevalo", "Alejandra", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Navarro", "Guzman", "Florentina", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Navia", null, "Cecilia Rocio", "C041", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Ochoa", "Gregorio", "Cinthia", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Orellana", "Rivas", "Cinthia", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Osorio", "Fuertes", "Sonia", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Padilla", null, "Eloy", "C084", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Pardo", "Claure", "Heenry Adam", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Paredes", "Antezana", "Marco Eufronio", "C083", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Patzi", "Zubieta", "Javier Angel", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Peña", "Gómez", "Fernando Eulogio", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Pereira", "Herrera", "Miriam", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Pereira", "Viscarra", "Juan", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Perez", "Quiroz", "Tatiana Alejandra", "C066", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Ponce", "Gonzales", "Ines Ruth", "C074", "SERV_INFORMACION"),
            new SeedEmpleado("Quiroga", "Orellana", "Klendy Mauricio", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Quiroga", "Orellana", "Mauricio", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Quiroga", "Saravia", "Gualberto Daniel", "C025", "SERV_ADMINISTRATIVO"),
            new SeedEmpleado("Quiroga", "Saravia", "Gualberto Daniel", "C025", "SERV_DIRECCION_ADMINISTRATIVA"),
            new SeedEmpleado("Quiroga", "Saravia", "Juan Carlos", "C050", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Quiroz", null, "Boris", "C081", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Quiroz", "Alcocer", "Boris", "C062", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Quiroz", "Camperos", "Gilmar", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Quiroz", "Camperos", "Gilmar", "C044", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Quiroz", "Camperos", "Gilmar", "C045", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Ramos", "Sanabria", "Lidia", "C020", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Rocha", "Escobar", "Ruth", "C005", "SERV_CONTABILIDAD"),
            new SeedEmpleado("Rocha", "Rodrigez", "Lino Mauricio", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Rocha", "Vallejos", "Israel", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Rojas", "Cisneros", "Maria Carmen", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Rojas", "Iriarte", "Jhiovana", "C019", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Salazar", "Gonzales", "Gabriela Veronica", "C049", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Salinas", "Argandoña", "Walter Gil", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Sanchez", "Ugarte", "Juan Carlos", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Sanchez", "Ugarte", "Juan Carlos", "C064", "SERV_ECOGRAFIA"),
            new SeedEmpleado("Santa Cruz", "Troncoso", "Ana Maria", "C039", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Santeyana", "Moron", "Nohelia", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Soraide", "Baldivieso", "Jeanneth", "C071", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Soraide", "Baldivieso", "Jeanneth", "C070", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Soria", "Gallegos", "Ramiro", "C067", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Suarez", "Bravo", "Zulma Adriana", "C055", "SERV_TECNICO_MEDIO_ENFERMERIA"),
            new SeedEmpleado("Suarez", "Bravo", "Zulma Adriana", "C072", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Suarez", "Bravo", "Zulma Adriana", "C054", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Toro", "Cespedes", "Paola Alejandra", "C052", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Torrez", null, "Fabiola", "C027", "SERV_ECOGRAFIA"),
            new SeedEmpleado("Torrico", "Castellon", "Monica Jimena", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Torrico", "Escobar", "Jheraldine Jacqueline", "C067", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Torrico", "Perez", "Edly", "C078", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Ugarte", null, "Daniela", "C027", "SERV_ECOGRAFIA"),
            new SeedEmpleado("Valencia", "Jaldin", "Fernando", "C036", "SERV_MANTENIMIENTO"),
            new SeedEmpleado("Vargas", null, "Carol Rocio", "C001", "SERV_ADMINISTRATIVO"),
            new SeedEmpleado("Vargas", null, "Edson", "C021", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Vargas", "Adrian", "Silvia Marina", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Vargas", "Rojas", "Carol Rocio", "C001", "SERV_ADMINISTRATIVO"),
            new SeedEmpleado("Veintemillas", "Veizaga", "Luis Carlos", "C023", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Veliz", "Moya", "Joselin Valeria", "C008", "SERV_TECNICO_ENFERMERIA"),
            new SeedEmpleado("Veliz", "Moya", "Joselin Valeria", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Veliz", "Moya", "Joselin Valeria", "C009", "SERV_TECNICO_MEDIO_ENFERMERIA"),
            new SeedEmpleado("Via", "Jimenez", "Charly Carlos", "C054", "SERV_AUXILIARES_ENFERMERIA"),
            new SeedEmpleado("Villarroel", "Luizaga", "Diego Alejandro", "C065", "SERV_MEDICO_GUARDIA"),
            new SeedEmpleado("Villarroel", "Martinez", "Victor manuel", "C002", "SERV_QUIROFANO"),
            new SeedEmpleado("Villca", null, "Lesly Widath", "C067", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Zabalaga", "Céspedes", "Fernando Javier", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Zabalaga", "Retamozo", "Jorge Edmundo", "C064", "SERV_CONSULTA_EXTERNA"),
            new SeedEmpleado("Zelada", "Rodriguez", "Claudia Isabel", "C039", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Zelada", "Rodriguez", "Clauidia Isabel", "C044", "SERV_LICENCIADOS_ENFERMERIA"),
            new SeedEmpleado("Zelada", "Rodriguez", "Clauidia Isabel", "C040", "SERV_LICENCIADOS_ENFERMERIA"),
        ];
    }

    private sealed record SeedTipoArea(
        string Codigo,
        string Nombre,
        string? Descripcion,
        int Orden);

    private sealed record SeedArea(
        string Codigo,
        string Nombre,
        string? Descripcion,
        string TipoAreaCodigo,
        string? CodigoPadre,
        int Orden);

    private sealed record SeedCargo(
        string Codigo,
        string Nombre,
        string? Descripcion);

    private sealed record SeedEmpleado(
        string Paterno,
        string? Materno,
        string Nombres,
        string CargoCodigo,
        string AreaCodigo);
}