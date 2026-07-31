import { useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag } from 'antd'
import {
  CrudCreateHeader,
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import { categoriasProductoService } from '../../categorias/services/categorias.service'
import { formasFarmaceuticasService } from '../../formas-farmaceuticas/services/formas-farmaceuticas.service'
import { unidadesMedidaAlmacenService } from '../../unidades-medida/services/unidades-medida.service'
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
  const { data: categorias } = useAppQuery({
    queryKey: queryKeys.almacen.categorias.list({ page: 1, pageSize: 200 }),
    queryFn: () => categoriasProductoService.getPaged({ page: 1, pageSize: 200 }),
  })
  const { data: unidades } = useAppQuery({
    queryKey: queryKeys.almacen.unidadesMedida.list({ page: 1, pageSize: 200 }),
    queryFn: () => unidadesMedidaAlmacenService.getPaged({ page: 1, pageSize: 200 }),
  })
  const { data: formas } = useAppQuery({
    queryKey: queryKeys.almacen.formasFarmaceuticas.list({ page: 1, pageSize: 200 }),
    queryFn: () => formasFarmaceuticasService.getPaged({ page: 1, pageSize: 200 }),
  })

  const createMutation = useCreateProductoAlmacen()
  const updateMutation = useUpdateProductoAlmacen()
  const deleteMutation = useDeleteProductoAlmacen()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [form] = Form.useForm()
  const esMedicamento = Form.useWatch('esMedicamento', form)

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
      categoriaId: undefined,
      unidadMedidaId: undefined,
      stockMinimo: 0,
      stockMaximo: 0,
      controlaLote: true,
      controlaVencimiento: true,
      manejaSerie: false,
      esMedicamento: false,
      activo: true,
      medicamento: {
        requiereReceta: false,
        esControlado: false,
      },
    })
    setOpen(true)
  }

  const openEdit = (row: Producto) => {
    setEditing(row)
    form.setFieldsValue({
      ...row,
      medicamento: row.medicamento ?? {
        requiereReceta: false,
        esControlado: false,
      },
    })
    setOpen(true)
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      medicamento: values.esMedicamento ? values.medicamento : null,
    }
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data: payload })
    else await createMutation.mutateAsync(payload)
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
        width={640}
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
              showSearch
              optionFilterProp="label"
              options={(categorias?.items ?? []).map((c) => ({
                value: c.id,
                label: `${c.codigo} — ${c.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="unidadMedidaId" label="Unidad de medida" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(unidades?.items ?? []).map((u) => ({
                value: u.id,
                label: `${u.codigo} — ${u.nombre}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="codigoBarras" label="Código de barras">
            <Input />
          </Form.Item>
          <Form.Item name="stockMinimo" label="Stock mínimo">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stockMaximo" label="Stock máximo">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="controlaLote" label="Controla lote" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="controlaVencimiento" label="Controla vencimiento" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="manejaSerie" label="Maneja serie" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="esMedicamento" label="Es medicamento" valuePropName="checked">
            <Switch />
          </Form.Item>
          {esMedicamento ? (
            <>
              <Form.Item name={['medicamento', 'nombreGenerico']} label="Nombre genérico">
                <Input />
              </Form.Item>
              <Form.Item name={['medicamento', 'nombreComercial']} label="Nombre comercial">
                <Input />
              </Form.Item>
              <Form.Item name={['medicamento', 'concentracion']} label="Concentración">
                <Input />
              </Form.Item>
              <Form.Item name={['medicamento', 'presentacion']} label="Presentación">
                <Input />
              </Form.Item>
              <Form.Item name={['medicamento', 'formaFarmaceuticaId']} label="Forma farmacéutica">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={(formas?.items ?? []).map((f) => ({
                    value: f.id,
                    label: `${f.codigo} — ${f.nombre}`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name={['medicamento', 'requiereReceta']}
                label="Requiere receta"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={['medicamento', 'esControlado']}
                label="Es controlado"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          ) : null}
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
