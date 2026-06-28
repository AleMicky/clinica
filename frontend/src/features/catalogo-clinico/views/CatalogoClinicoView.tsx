import { useState } from 'react'
import { Flex, Grid, Typography } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'

import { CatalogoSimplePanel } from '../components/CatalogoSimplePanel'
import { getSectionMeta } from '../components/CatalogoClinicoSidebar'
import {
    useCreateTipoAtencionCatalogo,
    useDeleteTipoAtencionCatalogo,
    useTiposAtencionCatalogo,
    useUpdateTipoAtencionCatalogo,
} from '../hooks/catalogo-clinico.hooks'
import type { CatalogoBaseFormValues } from '../schemas/catalogo-clinico.schema'

const { Title, Text } = Typography
const { useBreakpoint } = Grid
const DEFAULT_PAGE_SIZE = 20

function toPayload(values: CatalogoBaseFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
    }
}

export function CatalogoClinicoView() {
    const screens = useBreakpoint()
    const isStacked = !screens.lg
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
        <div className="catalogo-clinico-view">
            <header className="catalogo-clinico-view__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={16}
                    wrap="wrap"
                >
                    <Flex align="center" gap={16} className="catalogo-clinico-view__header-main">
                        <div className="catalogo-clinico-view__header-icon" aria-hidden>
                            <DatabaseOutlined />
                        </div>
                        <div>
                            <Title level={3} className="catalogo-clinico-view__title">
                                Catálogo clínico
                            </Title>
                            <Text type="secondary" className="catalogo-clinico-view__subtitle">
                                Catálogos de atención médica y clasificaciones clínicas.
                            </Text>
                        </div>
                    </Flex>

                    <div className="catalogo-clinico-view__section-badge">
                        <span className="catalogo-clinico-view__section-badge-icon" aria-hidden>
                            {meta.icon}
                        </span>
                        <div className="catalogo-clinico-view__section-badge-content">
                            <Text type="secondary" className="catalogo-clinico-view__section-badge-label">
                                Sección activa
                            </Text>
                            <Text strong className="catalogo-clinico-view__section-badge-title">
                                {meta.title}
                            </Text>
                        </div>
                    </div>
                </Flex>
            </header>

            <div className="catalogo-clinico-view__workspace">
                <section className="catalogo-clinico-view__content">
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
                </section>
            </div>
        </div>
    )
}
