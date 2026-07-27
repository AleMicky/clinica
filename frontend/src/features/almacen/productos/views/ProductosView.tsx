import { useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag } from 'antd'
import {
  CrudCreateHeader,
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { useCategoriasAlmacen } from '../../categorias/hooks/categorias.hooks'
import { useUnidadesMedida } from '../../../parametros/unidades-medida/hooks/unidades-medida.hooks'
import {
  useCreateProductoAlmacen,
  useDeleteProductoAlmacen,
  useProductosAlmacen,
  useUpdateProductoAlmacen,
} from '../hooks/productos.hooks'
import type { Producto } from '../types/producto.types'

export function ProductosAlmacenView() {
  const filters = usePagedSearchFilters()
  const { data, isFetching } = useProductosAlmacen({
    page: filters.page,
    pageSize: filters.pageSize,
  })
  const { data: categorias } = useCategoriasAlmacen({ page: 1, pageSize: 100 })
  const { data: unidades } = useUnidadesMedida({ page: 1, pageSize: 100 })
  const createMutation = useCreateProductoAlmacen()
  const updateMutation = useUpdateProductoAlmacen()
  const deleteMutation = useDeleteProductoAlmacen()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [form] = Form.useForm()

  const items = useMemo(() => {
    const source = data?.items ?? []
    if (!filters.search) return source
    const s = filters.search.toLowerCase()
    return source.filter(
      (x) =>
        x.codigo.toLowerCase().includes(s) || x.nombre.toLowerCase().includes(s),
    )
  }, [data?.items, filters.search])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      codigo: '',
      nombre: '',
      stockMinimo: 0,
      controlaLote: true,
      controlaVencimiento: true,
      esMedicamento: false,
      activo: true,
    })
    setOpen(true)
  }

  const openEdit = (row: Producto) => {
    setEditing(row)
    form.setFieldsValue(row)
    setOpen(true)
  }

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
            ariaLabel="Filtros de productos"
            searchAriaLabel="Buscar producto"
            placeholder="Buscar por código o nombre…"
          />
        }
        actions={
          <CrudCreateHeader label="Nuevo producto" ariaLabel="Crear producto" onCreate={openCreate} />
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
            { title: 'Categoría', dataIndex: 'categoriaNombre' },
            { title: 'Stock mín.', dataIndex: 'stockMinimo' },
            {
              title: 'Medicamento',
              dataIndex: 'esMedicamento',
              render: (v: boolean) => (v ? <Tag color="blue">Sí</Tag> : 'No'),
            },
            {
              title: 'Estado',
              dataIndex: 'activo',
              render: (v: boolean) => (
                <Tag color={v ? 'green' : 'default'}>{v ? 'Activo' : 'Inactivo'}</Tag>
              ),
            },
            {
              title: 'Acciones',
              render: (_, row) => (
                <Space>
                  <Button size="small" onClick={() => openEdit(row)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => void deleteMutation.mutateAsync(row.id)}
                  >
                    Eliminar
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </CrudSectionPanel>

      <Modal
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleOk()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoriaId" label="Categoría" rules={[{ required: true }]}>
            <Select
              options={(categorias?.items ?? []).map((c) => ({
                value: c.id,
                label: c.nombre,
              }))}
            />
          </Form.Item>
          <Form.Item name="unidadMedidaId" label="Unidad de medida" rules={[{ required: true }]}>
            <Select
              options={(unidades?.items ?? []).map((u: { id: string; nombre: string }) => ({
                value: u.id,
                label: u.nombre,
              }))}
            />
          </Form.Item>
          <Form.Item name="stockMinimo" label="Stock mínimo">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="controlaLote" label="Controla lote" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="controlaVencimiento" label="Controla vencimiento" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="esMedicamento" label="Es medicamento" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
