import { useState } from 'react'

import { CatalogoSimplePanel } from '../../catalogo-clinico/components/CatalogoSimplePanel'
import {
    useCargos,
    useCreateCargo,
    useCreateEspecialidad,
    useCreateProfesion,
    useDeleteCargo,
    useDeleteEspecialidad,
    useDeleteProfesion,
    useEspecialidades,
    useProfesiones,
    useUpdateCargo,
    useUpdateEspecialidad,
    useUpdateProfesion,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import { rrhhCatalogSectionMeta, type RrhhCatalogSection } from '../types/rrhh.types'

const DEFAULT_PAGE_SIZE = 20

function toPayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
    }
}

type CatalogoRrhhViewProps = {
    section: RrhhCatalogSection
}

export function CatalogoRrhhView({ section }: CatalogoRrhhViewProps) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')

    const query = { page, pageSize, search: search || undefined }
    const meta = rrhhCatalogSectionMeta[section]

    const especialidades = useEspecialidades(query)
    const profesiones = useProfesiones(query)
    const cargos = useCargos(query)

    const createEspecialidad = useCreateEspecialidad()
    const updateEspecialidad = useUpdateEspecialidad()
    const deleteEspecialidad = useDeleteEspecialidad()
    const createProfesion = useCreateProfesion()
    const updateProfesion = useUpdateProfesion()
    const deleteProfesion = useDeleteProfesion()
    const createCargo = useCreateCargo()
    const updateCargo = useUpdateCargo()
    const deleteCargo = useDeleteCargo()

    const config = {
        especialidades: {
            data: especialidades,
            create: createEspecialidad,
            update: updateEspecialidad,
            delete: deleteEspecialidad,
        },
        profesiones: {
            data: profesiones,
            create: createProfesion,
            update: updateProfesion,
            delete: deleteProfesion,
        },
        cargos: {
            data: cargos,
            create: createCargo,
            update: updateCargo,
            delete: deleteCargo,
        },
    }[section]

    const isSaving = config.create.isPending || config.update.isPending

    return (
        <CatalogoSimplePanel
            title={meta.title}
            subtitle={meta.description}
            entityLabel={meta.entityLabel}
            newButtonLabel={meta.newButtonLabel}
            searchPlaceholder={meta.searchPlaceholder}
            items={config.data.data?.items ?? []}
            total={config.data.data?.totalRecords ?? 0}
            page={page}
            pageSize={pageSize}
            search={search}
            loading={config.data.isFetching}
            isSaving={isSaving}
            onPageChange={(nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
            }}
            onSearch={(value) => {
                setSearch(value)
                setPage(1)
            }}
            onCreate={async (values) => {
                await config.create.mutateAsync(toPayload(values))
            }}
            onUpdate={async (id, values) => {
                await config.update.mutateAsync({ id, data: toPayload(values) })
            }}
            onDelete={async (id) => {
                await config.delete.mutateAsync(id)
            }}
        />
    )
}
