import { useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Space, Switch, Table, Tag } from 'antd'
import {
  CrudCreateHeader,
  CrudSearchFiltersBar,
  CrudSectionPanel,
} from '../../../../shared/components/ui/crud-section'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import {
  useCategoriasAlmacen,
  useCreateCategoriaAlmacen,
  useDeleteCategoriaAlmacen,
  useUpdateCategoriaAlmacen,
} from '../hooks/categorias.hooks'
import type { Categoria } from '../types/categoria.types'

export function CategoriasAlmacenView() {
  const filters = usePagedSearchFilters()
  const { data, isFetching } = useCategoriasAlmacen({
    page: filters.page,
    pageSize: filters.pageSize,
  })
  const createMutation = useCreateCategoriaAlmacen()
  const updateMutation = useUpdateCategoriaAlmacen()
  const deleteMutation = useDeleteCategoriaAlmacen()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
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
    form.setFieldsValue({ codigo: '', nombre: '', activo: true })
    setOpen(true)
  }

  const openEdit = (row: Categoria) => {
    setEditing(row)
    form.setFieldsValue(row)
    setOpen(true)
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
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
            ariaLabel="Filtros de categorías"
            searchAriaLabel="Buscar categoría"
            placeholder="Buscar por código o nombre…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva categoría"
            ariaLabel="Crear categoría"
            onCreate={openCreate}
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
                    loading={deleteMutation.isPending}
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
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void handleOk()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
