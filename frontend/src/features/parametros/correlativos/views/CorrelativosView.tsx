import { useEffect, useMemo, useRef, useState } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Flex, Input, Tag, theme } from 'antd'
import { NumberOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { GenerarCorrelativoModal } from '../components/GenerarCorrelativoModal'
import {
    useCorrelativos,
    useGenerarCorrelativo,
} from '../hooks/correlativos.hooks'
import type { GenerarCorrelativoFormValues } from '../schemas/correlativo.schema'
import type { Correlativo } from '../types/correlativo.types'

const DEFAULT_PAGE_SIZE = 20
const columnHelper = createColumnHelper<Correlativo>()

export function CorrelativosView() {
    const { token } = theme.useToken()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [codigo, setCodigo] = useState('')
    const [codigoInput, setCodigoInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)

    const onFilterRef = useRef((value: string) => {
        setCodigo(value)
        setPage(1)
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onFilterRef.current(codigoInput.trim())
        }, 400)
        return () => window.clearTimeout(timer)
    }, [codigoInput])

    const { data, isFetching } = useCorrelativos({
        page,
        pageSize,
        codigo: codigo || undefined,
    })
    const generarMutation = useGenerarCorrelativo()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 140,
                    cell: ({ getValue }) => (
                        <Tag className="catalogo-clinico-code-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('gestion', {
                    header: 'Gestión',
                    size: 90,
                }),
                columnHelper.accessor('prefijo', {
                    header: 'Prefijo',
                    size: 100,
                    cell: ({ getValue }) => getValue() || '—',
                }),
                columnHelper.accessor('ultimoNumero', {
                    header: 'Último N°',
                    size: 100,
                }),
                columnHelper.accessor('longitud', {
                    header: 'Longitud',
                    size: 90,
                }),
                columnHelper.accessor('numeroFormateado', {
                    header: 'Formato',
                    cell: ({ getValue }) => (
                        <Tag icon={<NumberOutlined />}>{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('fechaActualizacion', {
                    header: 'Actualizado',
                    size: 140,
                    cell: ({ row }) => {
                        const value =
                            row.original.fechaActualizacion ??
                            row.original.fechaCreacion
                        return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—'
                    },
                }),
            ] as ColumnDef<Correlativo, unknown>[],
        [],
    )

    const handleSubmit = async (values: GenerarCorrelativoFormValues) => {
        await generarMutation.mutateAsync({
            codigo: values.codigo,
            gestion: values.gestion ?? null,
            prefijo: values.prefijo || null,
            longitud: values.longitud ?? null,
        })
        setModalOpen(false)
    }

    const caption = `${total} correlativo${total === 1 ? '' : 's'}${
        codigo ? ` · "${codigo}"` : ''
    }`

    return (
        <>
            <div className="rrhh-section-panel rrhh-catalogo">
                <div className="rrhh-section-panel__filters">
                    <Flex
                        gap={6}
                        wrap="wrap"
                        align="center"
                        className="rrhh-catalogo__filters"
                        role="search"
                        aria-label="Filtros de correlativos"
                    >
                        <Input
                            allowClear
                            size="small"
                            className="rrhh-catalogo__filter-search"
                            prefix={
                                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                            }
                            placeholder="Filtrar por código…"
                            value={codigoInput}
                            onChange={(e) => setCodigoInput(e.target.value)}
                            onPressEnter={() => {
                                setCodigo(codigoInput.trim())
                                setPage(1)
                            }}
                            onClear={() => {
                                setCodigoInput('')
                                setCodigo('')
                                setPage(1)
                            }}
                        />
                    </Flex>
                    <Flex gap={6} wrap="wrap" align="center" className="rrhh-section-panel__actions">
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => setModalOpen(true)}
                        >
                            Generar
                        </Button>
                    </Flex>
                </div>
                <div className="rrhh-section-panel__body">
                    <p className="rrhh-section-panel__caption rrhh-catalogo__caption">{caption}</p>
                    <AppDataTable
                        className="rrhh-catalogo__table"
                        data={items}
                        columns={columns}
                        loading={isFetching}
                        emptyText="No hay correlativos registrados."
                        getRowId={(row) => String(row.id)}
                        pagination={{
                            page,
                            pageSize,
                            total,
                            pageSizeOptions: [10, 20, 50],
                            onChange: (nextPage, nextPageSize) => {
                                setPage(nextPage)
                                setPageSize(nextPageSize)
                            },
                        }}
                    />
                </div>
            </div>

            <GenerarCorrelativoModal
                open={modalOpen}
                loading={generarMutation.isPending}
                onClose={() => {
                    if (!generarMutation.isPending) setModalOpen(false)
                }}
                onSubmit={handleSubmit}
            />
        </>
    )
}
