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
import { formasFarmaceuticasService } from '../services/formas-farmaceuticas.service'
import type { FormaFarmaceutica } from '../types/forma-farmaceutica.types'

export function FormasFarmaceuticasView() {
  const filters = usePagedSearchFilters()
  const qc = useQueryClient()
  const { data, isFetching } = useAppQuery({
    queryKey: queryKeys.almacen.formasFarmaceuticas.list({
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    queryFn: () =>
      formasFarmaceuticasService.getPaged({ page: filters.page, pageSize: filters.pageSize }),
  })
  const createMutation = useAppMutation({
    mutationFn: formasFarmaceuticasService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.formasFarmaceuticas.all })
      notify.success('Forma creada', 'Registro guardado.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const updateMutation = useAppMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof formasFarmaceuticasService.update>[1]
    }) => formasFarmaceuticasService.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.formasFarmaceuticas.all })
      notify.success('Forma actualizada', 'Cambios guardados.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })
  const deleteMutation = useAppMutation({
    mutationFn: formasFarmaceuticasService.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.almacen.formasFarmaceuticas.all })
      notify.success('Forma eliminada', 'Se eliminó correctamente.')
    },
    onError: (e) => notify.error('Error', getApiErrorMessage(e)),
  })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FormaFarmaceutica | null>(null)
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
            ariaLabel="Filtros de formas farmacéuticas"
            searchAriaLabel="Buscar forma"
            placeholder="Buscar por código o nombre…"
          />
        }
        actions={
          <CrudCreateHeader
            label="Nueva forma"
            ariaLabel="Crear forma farmacéutica"
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
        title={editing ? 'Editar forma' : 'Nueva forma farmacéutica'}
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
