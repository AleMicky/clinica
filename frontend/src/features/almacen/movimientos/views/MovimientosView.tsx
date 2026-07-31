import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useQueryClient } from '@tanstack/react-query'
import {
  CrudCreateHeader,
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { almacenesCatalogService } from '../../almacenes/services/almacenes.service'
import { useProductosAlmacen } from '../../productos/hooks/productos.hooks'
import { movimientosAlmacenService } from '../services/movimientos.service'
import type { Movimiento } from '../types/movimiento.types'

type MovimientoTipoCreate = 'ingreso' | 'salida' | 'ajuste' | 'baja' | 'transferencia'

export function MovimientosAlmacenView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.movimientos.list({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
    }),
    queryFn: () =>
      movimientosAlmacenService.getPaged({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
      }),
  })
  const { data: productos } = useProductosAlmacen({ page: 1, pageSize: 200 })
  const { data: almacenes } = useAppQuery({
    queryKey: queryKeys.almacen.almacenes.list({ page: 1, pageSize: 100 }),
    queryFn: () => almacenesCatalogService.getPaged({ page: 1, pageSize: 100 }),
  })

  const [createTipo, setCreateTipo] = useState<MovimientoTipoCreate | null>(null)
  const [detail, setDetail] = useState<Movimiento | null>(null)
  const [form] = Form.useForm()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.almacen.movimientos.all })
  }

  const createMutation = useAppMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const lineas = [
        {
          productoId: values.productoId as string,
          cantidad: values.cantidad as number,
          costoUnitario: (values.costoUnitario as number | undefined) ?? null,
          numeroLote: (values.numeroLote as string | undefined) ?? null,
          fechaVencimiento: (values.fechaVencimiento as string | undefined) ?? null,
        },
      ]
      const observaciones = (values.observaciones as string | undefined) ?? null
      const almacenId = (values.almacenId as string | undefined) ?? null

      switch (createTipo) {
        case 'ingreso':
          return movimientosAlmacenService.registrarIngreso({
            lineas,
            observaciones,
            almacenId,
          })
        case 'salida':
          return movimientosAlmacenService.registrarSalida({
            lineas,
            observaciones,
            usarFefo: (values.usarFefo as boolean | undefined) ?? true,
            almacenId,
          })
        case 'ajuste':
          return movimientosAlmacenService.registrarAjuste({
            lineas,
            observaciones,
            almacenId,
          })
        case 'baja':
          return movimientosAlmacenService.registrarBaja({
            lineas,
            observaciones,
            almacenId,
          })
        case 'transferencia':
          return movimientosAlmacenService.registrarTransferencia({
            lineas,
            observaciones,
            almacenOrigenId: (values.almacenOrigenId as string | undefined) ?? null,
            almacenDestinoId: (values.almacenDestinoId as string | undefined) ?? null,
          })
        default:
          throw new Error('Tipo de movimiento no soportado')
      }
    },
    onSuccess: () => {
      invalidate()
      notify.success('Movimiento registrado', 'Operación completada.')
      setCreateTipo(null)
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const aplicarMutation = useAppMutation({
    mutationFn: (id: string) => movimientosAlmacenService.aplicar(id),
    onSuccess: () => {
      invalidate()
      notify.success('Movimiento aplicado', 'Stock actualizado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const anularMutation = useAppMutation({
    mutationFn: (id: string) => movimientosAlmacenService.anular(id),
    onSuccess: () => {
      invalidate()
      notify.success('Movimiento anulado', 'Estado actualizado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const openCreate = (tipo: MovimientoTipoCreate) => {
    setCreateTipo(tipo)
    form.resetFields()
    form.setFieldsValue({ usarFefo: true, cantidad: 1 })
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    await createMutation.mutateAsync(values)
  }

  const openDetail = async (id: string) => {
    try {
      const mov = await movimientosAlmacenService.getById(id)
      setDetail(mov)
    } catch (e) {
      notify.error('Error', getApiErrorMessage(e))
    }
  }

  const tituloCreate =
    createTipo === 'ingreso'
      ? 'Registrar ingreso'
      : createTipo === 'salida'
        ? 'Registrar salida'
        : createTipo === 'ajuste'
          ? 'Registrar ajuste'
          : createTipo === 'baja'
            ? 'Registrar baja'
            : 'Transferencia simple'

  return (
    <>
      <CrudSectionPanel
        filters={
          <CrudSearchFiltersBar
            searchInput={filters.searchInput}
            hasActiveFilters={filters.hasActiveFilters}
            onSearchInputChange={filters.handleSearchInputChange}
            onSearch={filters.handleSearch}
            onClearFilters={filters.clearFilters}
            ariaLabel="Filtros de movimientos"
            searchAriaLabel="Buscar movimiento"
            placeholder="Buscar por número…"
          />
        }
        actions={
          <Space wrap>
            <CrudCreateHeader
              label="Ingreso"
              ariaLabel="Registrar ingreso"
              onCreate={() => openCreate('ingreso')}
            />
            <Button onClick={() => openCreate('salida')}>Salida</Button>
            <Button onClick={() => openCreate('ajuste')}>Ajuste</Button>
            <Button onClick={() => openCreate('baja')}>Baja</Button>
            <Button onClick={() => openCreate('transferencia')}>Transferencia</Button>
          </Space>
        }
        caption={formatRegistrosCaption(data?.totalRecords ?? 0, filters.hasActiveFilters)}
      >
        <Table
          rowKey="id"
          loading={isFetching}
          dataSource={data?.items ?? []}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalRecords ?? 0,
            onChange: filters.handlePageChange,
          }}
          columns={[
            { title: 'Número', dataIndex: 'numero' },
            { title: 'Tipo', dataIndex: 'tipo' },
            {
              title: 'Fecha',
              dataIndex: 'fecha',
              render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
            },
            {
              title: 'Estado',
              dataIndex: 'estado',
              render: (v: string) => <Tag>{v}</Tag>,
            },
            {
              title: 'Acciones',
              render: (_, row) => (
                <Space wrap>
                  <Button size="small" onClick={() => void openDetail(row.id)}>
                    Ver
                  </Button>
                  {row.estado === 'Borrador' ? (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => void aplicarMutation.mutateAsync(row.id)}
                    >
                      Aplicar
                    </Button>
                  ) : null}
                  {row.estado !== 'Anulado' ? (
                    <Button
                      size="small"
                      danger
                      onClick={() => void anularMutation.mutateAsync(row.id)}
                    >
                      Anular
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </CrudSectionPanel>

      <Modal
        title={tituloCreate}
        open={!!createTipo}
        onCancel={() => setCreateTipo(null)}
        onOk={() => void handleCreate()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(productos?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.codigo} — ${p.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          {createTipo === 'ingreso' ? (
            <>
              <Form.Item name="numeroLote" label="Número de lote">
                <Input />
              </Form.Item>
              <Form.Item name="fechaVencimiento" label="Fecha vencimiento (YYYY-MM-DD)">
                <Input placeholder="2027-12-31" />
              </Form.Item>
              <Form.Item name="costoUnitario" label="Costo unitario">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null}
          {createTipo === 'salida' ? (
            <Form.Item name="usarFefo" label="Usar FEFO" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
          {createTipo === 'transferencia' ? (
            <>
              <Form.Item name="almacenOrigenId" label="Almacén origen" rules={[{ required: true }]}>
                <Select
                  options={(almacenes?.items ?? []).map((a) => ({
                    value: a.id,
                    label: a.nombre,
                  }))}
                />
              </Form.Item>
              <Form.Item name="almacenDestinoId" label="Almacén destino" rules={[{ required: true }]}>
                <Select
                  options={(almacenes?.items ?? []).map((a) => ({
                    value: a.id,
                    label: a.nombre,
                  }))}
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item name="almacenId" label="Almacén">
              <Select
                allowClear
                options={(almacenes?.items ?? []).map((a) => ({
                  value: a.id,
                  label: a.nombre,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={detail ? `Movimiento ${detail.numero}` : 'Detalle'}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        {detail ? (
          <>
            <p>
              <Tag>{detail.tipo}</Tag> <Tag>{detail.estado}</Tag> —{' '}
              {dayjs(detail.fecha).format('DD/MM/YYYY HH:mm')}
            </p>
            <Table
              rowKey="id"
              pagination={false}
              dataSource={detail.detalles}
              columns={[
                { title: 'Producto', dataIndex: 'productoNombre' },
                { title: 'Lote', dataIndex: 'loteNumero' },
                { title: 'Cantidad', dataIndex: 'cantidad' },
                { title: 'Costo', dataIndex: 'costoUnitario' },
              ]}
            />
          </>
        ) : null}
      </Modal>
    </>
  )
}
