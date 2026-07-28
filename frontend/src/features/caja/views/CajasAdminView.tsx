import { useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Switch, Typography } from 'antd'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import {
    CrudCreateHeader,
    CrudSectionPanel,
} from '../../../shared/components/ui/crud-section'
import { StatusBadge } from '../../../shared/components/ui/status-badge/StatusBadge'
import {
    useCajas,
    useCreateCaja,
    useUpdateCaja,
} from '../hooks/caja.hooks'
import type { CajaFisica } from '../types/caja.types'

const { Title } = Typography
const columnHelper = createColumnHelper<CajaFisica>()

export function CajasAdminView() {
    const { data, isFetching } = useCajas({ page: 1, pageSize: 50 })
    const createCaja = useCreateCaja()
    const updateCaja = useUpdateCaja()
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<CajaFisica | null>(null)
    const [codigo, setCodigo] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [activo, setActivo] = useState(true)

    const openCreate = () => {
        setEditing(null)
        setCodigo('')
        setNombre('')
        setDescripcion('')
        setActivo(true)
        setOpen(true)
    }

    const openEdit = (entity: CajaFisica) => {
        setEditing(entity)
        setCodigo(entity.codigo)
        setNombre(entity.nombre)
        setDescripcion(entity.descripcion ?? '')
        setActivo(entity.activo)
        setOpen(true)
    }

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', { header: 'Código' }),
                columnHelper.accessor('nombre', { header: 'Nombre' }),
                columnHelper.accessor('descripcion', {
                    header: 'Descripción',
                    cell: (info) => info.getValue() ?? '—',
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    cell: (info) => (
                        <StatusBadge
                            active={info.getValue()}
                            activeLabel="Activa"
                            inactiveLabel="Inactiva"
                        />
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: 'Acciones',
                    cell: ({ row }) => (
                        <Button type="link" onClick={() => openEdit(row.original)}>
                            Editar
                        </Button>
                    ),
                }),
            ] as ColumnDef<CajaFisica, unknown>[],
        [],
    )

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Title level={3} className="admin-page__title">
                    Administración de cajas
                </Title>
            </header>

            <CrudSectionPanel
                filters={<div />}
                caption={`${data?.totalRecords ?? 0} cajas`}
                actions={
                    <CrudCreateHeader
                        label="Nueva caja"
                        ariaLabel="Crear caja"
                        onCreate={openCreate}
                    />
                }
            >
                <AppDataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isFetching}
                    emptyText="No hay cajas registradas."
                    getRowId={(row) => row.id}
                    pagination={{
                        page: 1,
                        pageSize: 50,
                        total: data?.totalRecords ?? 0,
                        onChange: () => undefined,
                    }}
                    className="rrhh-empleados__table"
                />
            </CrudSectionPanel>

            <Modal
                title={editing ? 'Editar caja' : 'Nueva caja'}
                open={open}
                confirmLoading={createCaja.isPending || updateCaja.isPending}
                onCancel={() => setOpen(false)}
                onOk={() => {
                    if (editing) {
                        void updateCaja
                            .mutateAsync({
                                id: editing.id,
                                payload: {
                                    nombre,
                                    descripcion: descripcion || null,
                                    activo,
                                },
                            })
                            .then(() => setOpen(false))
                        return
                    }
                    void createCaja
                        .mutateAsync({
                            codigo,
                            nombre,
                            descripcion: descripcion || null,
                            activo,
                        })
                        .then(() => setOpen(false))
                }}
            >
                <Form layout="vertical">
                    {!editing ? (
                        <Form.Item label="Código" required>
                            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                        </Form.Item>
                    ) : null}
                    <Form.Item label="Nombre" required>
                        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Descripción">
                        <Input.TextArea
                            rows={2}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label="Activa">
                        <Switch checked={activo} onChange={setActivo} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
