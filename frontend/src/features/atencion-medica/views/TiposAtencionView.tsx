import { useState } from 'react'

import { CatalogoSimplePanel } from '../../catalogo-clinico/components/CatalogoSimplePanel'
import type { CatalogoBaseFormValues } from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { CatalogoBase } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { tiposAtencionHooks, useTiposAtencion } from '../hooks/atencion-medica.hooks'
import type { TipoAtencion } from '../types/atencion-medica.types'

const DEFAULT_PAGE_SIZE = 20

function toCatalogoBase(tipo: TipoAtencion): CatalogoBase {
    return {
        id: tipo.id,
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || null,
    }
}

function toPayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || '',
    }
}

export function TiposAtencionView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')

    const { data, isFetching } = useTiposAtencion({
        page,
        pageSize,
        search: search || undefined,
    })
    const createMutation = tiposAtencionHooks.useCreate()
    const updateMutation = tiposAtencionHooks.useUpdate()
    const deleteMutation = tiposAtencionHooks.useDelete()

    const isSaving = createMutation.isPending || updateMutation.isPending

    return (
        <div className="module-object-page__panel">
            <CatalogoSimplePanel
                title="Tipos de atención"
                subtitle="Catálogo de tipos de atención clínica (consulta, urgencia, etc.)"
                entityLabel="tipo de atención"
                newButtonLabel="Nuevo tipo"
                searchPlaceholder="Buscar por código o nombre…"
                items={(data?.items ?? []).map(toCatalogoBase)}
                total={data?.totalRecords ?? 0}
                page={page}
                pageSize={pageSize}
                search={search}
                loading={isFetching}
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
                    await createMutation.mutateAsync(toPayload(values))
                }}
                onUpdate={async (id, values) => {
                    await updateMutation.mutateAsync({ id, data: toPayload(values) })
                }}
                onDelete={async (id) => {
                    await deleteMutation.mutateAsync(id)
                }}
            />
        </div>
    )
}
