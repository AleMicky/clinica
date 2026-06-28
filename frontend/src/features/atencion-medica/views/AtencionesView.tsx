import { useState } from 'react'
import {
    Button,
    Flex,
    Grid,
    Statistic,
    Typography,
    theme,
} from 'antd'
import { MedicineBoxOutlined, PlusOutlined } from '@ant-design/icons'

import { AtencionFormModal } from '../components/AtencionFormModal'
import { AtencionesTable } from '../components/AtencionesTable'
import {
    useAtenciones,
    useCreateAtencion,
    useDeleteAtencion,
    useUpdateAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    toCreateAtencionPayload,
    toUpdateAtencionPayload,
    type AtencionFormValues,
} from '../schemas/atencion.schema'
import type { Atencion } from '../types/atencion-medica.types'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const DEFAULT_PAGE_SIZE = 20

export function AtencionesView() {
    const { token: _token } = theme.useToken()
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAtencion, setEditingAtencion] = useState<Atencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useAtenciones({ page, pageSize })
    const createAtencion = useCreateAtencion()
    const updateAtencion = useUpdateAtencion()
    const deleteAtencion = useDeleteAtencion()

    const atenciones = data?.items ?? []
    const totalAtenciones = data?.totalRecords ?? 0
    const isSaving = createAtencion.isPending || updateAtencion.isPending

    const openCreateModal = () => {
        setEditingAtencion(null)
        setModalOpen(true)
    }

    const openEditModal = (atencion: Atencion) => {
        setEditingAtencion(atencion)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingAtencion(null)
    }

    const handleSubmit = async (values: AtencionFormValues) => {
        if (editingAtencion) {
            await updateAtencion.mutateAsync({
                id: editingAtencion.id,
                data: toUpdateAtencionPayload(values),
            })
        } else {
            await createAtencion.mutateAsync(toCreateAtencionPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (atencion: Atencion) => {
        setDeletingId(atencion.id)

        try {
            await deleteAtencion.mutateAsync(atencion.id)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={16}
                    wrap="wrap"
                >
                    <Flex align="center" gap={16}>
                        <div className="admin-page__header-icon" aria-hidden>
                            <MedicineBoxOutlined />
                        </div>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Atenciones médicas
                            </Title>
                            <Text type="secondary">
                                Gestione las atenciones clínicas y sus datos asociados.
                            </Text>
                        </div>
                    </Flex>

                    <div className="admin-page__stat">
                        <Statistic
                            title="Registradas"
                            value={totalAtenciones}
                            prefix={<MedicineBoxOutlined />}
                            loading={isFetching}
                        />
                    </div>
                </Flex>
            </header>

            <div className="admin-page__workspace">
                <section className="admin-page__panel">
                    <div className="admin-page__panel-toolbar">
                        <div>
                            <Text strong>Listado de atenciones</Text>
                            <Text type="secondary" className="admin-page__panel-caption">
                                {totalAtenciones} registrada{totalAtenciones === 1 ? '' : 's'}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                        >
                            Nueva atención
                        </Button>
                    </div>

                    <div className="admin-page__panel-body">
                        <AtencionesTable
                            atenciones={atenciones}
                            loading={isFetching}
                            total={totalAtenciones}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={(nextPage, nextPageSize) => {
                                setPage(nextPage)
                                setPageSize(nextPageSize)
                            }}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            deletingId={deletingId}
                        />
                    </div>
                </section>
            </div>

            <AtencionFormModal
                open={modalOpen}
                atencion={editingAtencion}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
