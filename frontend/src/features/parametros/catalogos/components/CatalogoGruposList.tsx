import type { KeyboardEvent, MouseEvent } from 'react'
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
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import type { CatalogoGrupo } from '../types/catalogo.types'

const { Text } = Typography

type CatalogoGruposListProps = {
    grupos: CatalogoGrupo[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    selectedGrupoId: string | null
    onPageChange: (page: number, pageSize: number) => void
    onSelect: (grupo: CatalogoGrupo) => void
    onEdit: (grupo: CatalogoGrupo) => void
    onDelete: (grupo: CatalogoGrupo) => void
    deletingId: string | null
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
}

export function CatalogoGruposList({
    grupos,
    loading,
    total,
    page,
    pageSize,
    selectedGrupoId,
    onPageChange,
    onSelect,
    onEdit,
    onDelete,
    deletingId,
}: CatalogoGruposListProps) {
    const showEmpty = !loading && grupos.length === 0

    if (showEmpty) {
        return (
            <div className="catalogos-grupos-list__empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No hay grupos registrados."
                />
            </div>
        )
    }

    return (
        <div className="catalogos-grupos-list catalogos-grupos-list--compact">
            <div className="catalogos-grupos-list__items" role="listbox" aria-label="Grupos de catálogo">
                {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="catalogos-grupos-list__skeleton">
                              <Skeleton.Input active size="small" style={{ width: '100%' }} />
                          </div>
                      ))
                    : grupos.map((grupo) => {
                          const isSelected = selectedGrupoId === grupo.id

                          return (
                              <div
                                  key={grupo.id}
                                  role="option"
                                  aria-selected={isSelected}
                                  tabIndex={0}
                                  className={[
                                      'catalogos-grupos-list__item',
                                      isSelected ? 'catalogos-grupos-list__item--selected' : '',
                                  ]
                                      .filter(Boolean)
                                      .join(' ')}
                                  onClick={() => onSelect(grupo)}
                                  onKeyDown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault()
                                          onSelect(grupo)
                                      }
                                  }}
                              >
                                  <Tooltip
                                      title={grupo.descripcion || undefined}
                                      placement="right"
                                      mouseEnterDelay={0.4}
                                  >
                                      <div className="catalogos-grupos-list__item-content">
                                          <Text
                                              strong={isSelected}
                                              className="catalogos-grupos-list__item-name"
                                              ellipsis
                                          >
                                              {grupo.nombre}
                                          </Text>
                                          <code className="catalogos-grupos-list__item-code">
                                              {grupo.codigo}
                                          </code>
                                      </div>
                                  </Tooltip>

                                  <Flex
                                      align="center"
                                      gap={2}
                                      className="catalogos-grupos-list__item-actions"
                                      onClick={stopPropagation}
                                      onKeyDown={stopPropagation}
                                  >
                                      <Tooltip title="Editar">
                                          <Button
                                              type="text"
                                              size="small"
                                              icon={<EditOutlined />}
                                              aria-label={`Editar ${grupo.nombre}`}
                                              onClick={() => onEdit(grupo)}
                                          />
                                      </Tooltip>
                                      <Popconfirm
                                          title="Desactivar grupo"
                                          description={`¿Desea desactivar el catálogo "${grupo.nombre}"?`}
                                          okText="Desactivar"
                                          cancelText="Cancelar"
                                          okButtonProps={{
                                              danger: true,
                                              loading: deletingId === grupo.id,
                                          }}
                                          onConfirm={() => onDelete(grupo)}
                                      >
                                          <Tooltip title="Desactivar">
                                              <Button
                                                  type="text"
                                                  size="small"
                                                  danger
                                                  icon={<DeleteOutlined />}
                                                  aria-label={`Desactivar ${grupo.nombre}`}
                                                  loading={deletingId === grupo.id}
                                              />
                                          </Tooltip>
                                      </Popconfirm>
                                  </Flex>
                              </div>
                          )
                      })}
            </div>

            {total > pageSize && (
                <Flex justify="center" className="catalogos-grupos-list__pagination">
                    <Pagination
                        simple
                        size="small"
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger={false}
                        onChange={(nextPage, nextPageSize) =>
                            onPageChange(nextPage, nextPageSize)
                        }
                    />
                </Flex>
            )}
        </div>
    )
}
