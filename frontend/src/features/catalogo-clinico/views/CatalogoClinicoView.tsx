import { useState } from 'react'
import { DatabaseOutlined } from '@ant-design/icons'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { CatalogoSimplePanel } from '../components/CatalogoSimplePanel'
import { getSectionMeta } from '../components/CatalogoClinicoSidebar'
import {
    useCreateTipoAtencionCatalogo,
    useDeleteTipoAtencionCatalogo,
    useTiposAtencionCatalogo,
    useUpdateTipoAtencionCatalogo,
} from '../hooks/catalogo-clinico.hooks'
import type { CatalogoBaseFormValues } from '../schemas/catalogo-clinico.schema'

const DEFAULT_PAGE_SIZE = 20

function toPayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
    }
}

export function CatalogoClinicoView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')

    const meta = getSectionMeta('tipos-atencion')
    const query = { page, pageSize, search: search || undefined }

    const tiposAtencion = useTiposAtencionCatalogo(query)
    const createTipoAtencion = useCreateTipoAtencionCatalogo()
    const updateTipoAtencion = useUpdateTipoAtencionCatalogo()
    const deleteTipoAtencion = useDeleteTipoAtencionCatalogo()

    const isSaving = createTipoAtencion.isPending || updateTipoAtencion.isPending

    return (
        <ModuleObjectPage
            icon={<DatabaseOutlined />}
            title="Catálogo clínico"
            subtitle="Catálogos de atención médica y clasificaciones clínicas"
            activeSection={{ icon: meta.icon, title: meta.title }}
        >
            <div className="module-object-page__panel">
                <CatalogoSimplePanel
                    title={meta.title}
                    subtitle={meta.description}
                    entityLabel="tipo de atención"
                    newButtonLabel="Nuevo tipo"
                    searchPlaceholder="Buscar tipo de atención…"
                    items={tiposAtencion.data?.items ?? []}
                    total={tiposAtencion.data?.totalRecords ?? 0}
                    page={page}
                    pageSize={pageSize}
                    search={search}
                    loading={tiposAtencion.isFetching}
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
                        await createTipoAtencion.mutateAsync(toPayload(values))
                    }}
                    onUpdate={async (id, values) => {
                        await updateTipoAtencion.mutateAsync({ id, data: toPayload(values) })
                    }}
                    onDelete={async (id) => {
                        await deleteTipoAtencion.mutateAsync(id)
                    }}
                />
            </div>
        </ModuleObjectPage>
    )
}
