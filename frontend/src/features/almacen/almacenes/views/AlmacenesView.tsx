import { useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd'
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
import { useEmpleadosLookup } from '../../../recursos-humanos/hooks/medicos.hooks'
import { almacenesCatalogService } from '../services/almacenes.service'
import type { AlmacenCatalogo } from '../types/almacen.types'

export function AlmacenesCatalogView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.almacenes.list({
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    queryFn: () =>
      almacenesCatalogService.getPaged({ page: filters.page, pageSize: filters.pageSize }),
  })
  const { data: tipos } = useAppQuery({
    queryKey: queryKeys.almacen.almacenes.tipos,
    queryFn: () => almacenesCatalogService.getTipos(),
  })
  const { data: empleados } = useEmpleadosLookup()

  const createMutation = useAppMutation({
    mutationFn: almacenesCatalogService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.almacenes.all })
      notify.success('Almacén creado', 'Registro guardado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const updateMutation = useAppMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof almacenesCatalogService.update>[1]
    }) => almacenesCatalogService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.almacenes.all })
      notify.success('Almacén actualizado', 'Cambios guardados.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const deleteMutation = useAppMutation({
    mutationFn: almacenesCatalogService.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.almacenes.all })
      notify.success('Almacén eliminado', 'Se eliminó correctamente.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AlmacenCatalogo | null>(null)
  const [form] = Form.useForm()

  const items = useMemo(() => {
    const source = data?.items ?? []
    if (!filters.search) return source
    const s = filters.search.toLowerCase()
    return source.filter(
      (x) => x.codigo.toLowerCase().includes(s) || x.nombre.toLowerCase().includes(s),
    )
  }, [data?.items, filters.search])

  const handleOk = async () => {
    const values = await form.validateFields()
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data: values })
    else await createMutation.mutateAsync(values)
    setOpen(false)
  }

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
            ariaLabel="Filtros de almacenes"
            searchAriaLabel="Buscar almacén"
            placeholder="Buscar por código o nombre…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nuevo almacén"
            ariaLabel="Crear almacén"
            onCreate={() => {
              setEditing(null)
              form.setFieldsValue({
                permiteVenta: false,
                permiteDispensacion: false,
                permiteStockNegativo: false,
              })
              setOpen(true)
            }}
          />
        }
        caption={formatRegistrosCaption(
          filters.search ? items.length : (data?.totalRecords ?? 0),
          filters.hasActiveFilters,
        )}
      >
        <Table
          rowKey="id"
          loading={isFetching}
          dataSource={items}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: filters.search ? items.length : (data?.totalRecords ?? 0),
            onChange: filters.handlePageChange,
          }}
          columns={[
            { title: 'Código', dataIndex: 'codigo' },
            { title: 'Nombre', dataIndex: 'nombre' },
            { title: 'Tipo', dataIndex: 'tipoAlmacenNombre' },
            {
              title: 'Venta',
              dataIndex: 'permiteVenta',
              render: (v: boolean) => (v ? <Tag color="green">Sí</Tag> : 'No'),
            },
            {
              title: 'Dispensación',
              dataIndex: 'permiteDispensacion',
              render: (v: boolean) => (v ? <Tag color="blue">Sí</Tag> : 'No'),
            },
            {
              title: 'Acciones',
              render: (_, row) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditing(row)
                      form.setFieldsValue(row)
                      setOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="small" danger onClick={() => void deleteMutation.mutateAsync(row.id)}>
                    Eliminar
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </CrudSectionPanel>
      <Modal
        title={editing ? 'Editar almacén' : 'Nuevo almacén'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleOk()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tipoAlmacenId" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={(tipos ?? []).map((t) => ({ value: t.id, label: t.nombre }))}
            />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="responsableEmpleadoId" label="Responsable">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={(empleados?.items ?? []).map((e) => ({
                value: e.id,
                label: `${e.personaNombreCompleto} (${e.codigoEmpleado})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="permiteVenta" label="Permite venta" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="permiteDispensacion" label="Permite dispensación" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="permiteStockNegativo" label="Permite stock negativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
