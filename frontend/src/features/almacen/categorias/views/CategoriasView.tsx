import { useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Space, Table } from 'antd'
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
import { categoriasProductoService } from '../services/categorias.service'
import type { CategoriaProducto } from '../types/categoria.types'

export function CategoriasProductoView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.categorias.list({
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    queryFn: () =>
      categoriasProductoService.getPaged({ page: filters.page, pageSize: filters.pageSize }),
  })
  const createMutation = useAppMutation({
    mutationFn: categoriasProductoService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría creada', 'Registro guardado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const updateMutation = useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoriasProductoService.update>[1] }) =>
      categoriasProductoService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría actualizada', 'Cambios guardados.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const deleteMutation = useAppMutation({
    mutationFn: categoriasProductoService.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.categorias.all })
      notify.success('Categoría eliminada', 'Se eliminó correctamente.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CategoriaProducto | null>(null)
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
            ariaLabel="Filtros de categorías"
            searchAriaLabel="Buscar categoría"
            placeholder="Buscar por código o nombre…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva categoría"
            ariaLabel="Crear categoría"
            onCreate={() => {
              setEditing(null)
              form.resetFields()
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
            { title: 'Descripción', dataIndex: 'descripcion' },
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
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
