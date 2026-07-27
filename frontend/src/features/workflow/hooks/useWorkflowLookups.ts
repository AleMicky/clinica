import { useMemo } from 'react'

import { useAreas } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { useEmpleadosLookup } from '../../recursos-humanos/hooks/medicos.hooks'

const LOOKUP_QUERY = { page: 1, pageSize: 200 } as const

export function useWorkflowAreaOptions() {
    const { data, isFetching } = useAreas(LOOKUP_QUERY)

    const options = useMemo(
        () =>
            (data?.items ?? []).map((area) => ({
                value: area.id,
                label: `${area.codigo} · ${area.nombre}`,
            })),
        [data?.items],
    )

    return { options, loading: isFetching }
}

export function useWorkflowEmployeeOptions() {
    const { data, isFetching } = useEmpleadosLookup()

    const options = useMemo(
        () =>
            (data?.items ?? []).map((empleado) => ({
                value: empleado.id,
                label: `${empleado.personaNombreCompleto} (${empleado.codigoEmpleado})`,
            })),
        [data?.items],
    )

    const nameById = useMemo(() => {
        const map = new Map<string, string>()
        for (const empleado of data?.items ?? []) {
            map.set(empleado.id, empleado.personaNombreCompleto)
        }
        return map
    }, [data?.items])

    return { options, nameById, loading: isFetching }
}
