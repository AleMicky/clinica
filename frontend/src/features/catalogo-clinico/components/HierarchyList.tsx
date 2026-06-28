import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import {
    Button,
    Empty,
    Flex,
    Pagination,
    Popconfirm,
    Skeleton,
    Tooltip,
    Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, RightOutlined } from '@ant-design/icons'

const { Text } = Typography

export type HierarchyListItem = {
    id: string
    codigo: string
    nombre: string
    descripcion?: string | null
    meta?: string
}

type HierarchyListProps = {
    items: HierarchyListItem[]
    loading: boolean
    total?: number
    page?: number
    pageSize?: number
    selectedId: string | null
    emptyText: string
    icon: ReactNode
    onPageChange?: (page: number, pageSize: number) => void
    onSelect: (item: HierarchyListItem) => void
    onEdit: (item: HierarchyListItem) => void
    onDelete: (item: HierarchyListItem) => void
    deletingId: string | null
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
}

export function HierarchyList({
    items,
    loading,
    total,
    page,
    pageSize,
    selectedId,
    emptyText,
    icon,
    onPageChange,
    onSelect,
    onEdit,
    onDelete,
    deletingId,
}: HierarchyListProps) {
    const showEmpty = !loading && items.length === 0
    const showPagination =
        onPageChange && total !== undefined && page !== undefined && pageSize !== undefined

    if (showEmpty) {
        return (
            <div className="catalogo-clinico-list__empty">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
            </div>
        )
    }

    return (
        <div className="catalogo-clinico-list">
            <div className="catalogo-clinico-list__items" role="listbox">
                {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="catalogo-clinico-list__skeleton">
                              <Skeleton.Avatar active size={36} shape="square" />
                              <Skeleton.Input active size="small" style={{ width: '70%' }} />
                          </div>
                      ))
                    : items.map((item) => {
                          const isSelected = selectedId === item.id

                          return (
                              <div
                                  key={item.id}
                                  role="option"
                                  aria-selected={isSelected}
                                  tabIndex={0}
                                  className={[
                                      'catalogo-clinico-list__item',
                                      isSelected ? 'catalogo-clinico-list__item--selected' : '',
                                  ]
                                      .filter(Boolean)
                                      .join(' ')}
                                  onClick={() => onSelect(item)}
                                  onKeyDown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault()
                                          onSelect(item)
                                      }
                                  }}
                              >
                                  <div className="catalogo-clinico-list__item-icon" aria-hidden>
                                      {icon}
                                  </div>

                                  <div className="catalogo-clinico-list__item-content">
                                      <Flex align="center" gap={6} wrap="wrap">
                                          <Text strong ellipsis className="catalogo-clinico-list__item-name">
                                              {item.nombre}
                                          </Text>
                                          <code className="catalogo-clinico-list__item-code">
                                              {item.codigo}
                                          </code>
                                      </Flex>
                                      {item.meta ? (
                                          <Text type="secondary" className="catalogo-clinico-list__item-meta">
                                              {item.meta}
                                          </Text>
                                      ) : null}
                                  </div>

                                  <Flex
                                      align="center"
                                      gap={2}
                                      className="catalogo-clinico-list__item-actions"
                                      onClick={stopPropagation}
                                      onKeyDown={stopPropagation}
                                  >
                                      <Tooltip title="Editar">
                                          <Button
                                              type="text"
                                              size="small"
                                              icon={<EditOutlined />}
                                              onClick={() => onEdit(item)}
                                          />
                                      </Tooltip>
                                      <Popconfirm
                                          title="Desactivar registro"
                                          description={`¿Desactivar "${item.nombre}"?`}
                                          okText="Desactivar"
                                          cancelText="Cancelar"
                                          okButtonProps={{
                                              danger: true,
                                              loading: deletingId === item.id,
                                          }}
                                          onConfirm={() => onDelete(item)}
                                      >
                                          <Tooltip title="Desactivar">
                                              <Button
                                                  type="text"
                                                  size="small"
                                                  danger
                                                  icon={<DeleteOutlined />}
                                                  loading={deletingId === item.id}
                                              />
                                          </Tooltip>
                                      </Popconfirm>
                                  </Flex>

                                  <RightOutlined
                                      className="catalogo-clinico-list__item-chevron"
                                      aria-hidden
                                  />
                              </div>
                          )
                      })}
            </div>

            {showPagination && total! > pageSize! && (
                <Flex justify="center" className="catalogo-clinico-list__pagination">
                    <Pagination
                        simple
                        size="small"
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger={false}
                        onChange={onPageChange}
                    />
                </Flex>
            )}
        </div>
    )
}
