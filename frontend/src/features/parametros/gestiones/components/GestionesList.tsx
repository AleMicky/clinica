import type { KeyboardEvent, MouseEvent } from 'react'
import {
    Button,
    Flex,
    Pagination,
    Popconfirm,
    Skeleton,
    Tooltip,
    Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { StatusBadge } from '../../../../shared/components/ui/status-badge/StatusBadge'
import type { Gestion } from '../types/gestiones.types'

const { Text } = Typography

type GestionesListProps = {
    gestiones: Gestion[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    selectedId: string | null
    onPageChange: (page: number, pageSize: number) => void
    onSelect: (gestion: Gestion) => void
    onEdit: (gestion: Gestion) => void
    onDelete: (gestion: Gestion) => void
    deletingId: string | null
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation()
}

function formatDateRange(inicio: string, fin: string) {
    return `${dayjs(inicio).format('DD/MM/YY')} – ${dayjs(fin).format('DD/MM/YY')}`
}

export function GestionesList({
    gestiones,
    loading,
    total,
    page,
    pageSize,
    selectedId,
    onPageChange,
    onSelect,
    onEdit,
    onDelete,
    deletingId,
}: GestionesListProps) {
    return (
        <div className="catalogos-grupos-list catalogos-grupos-list--compact">
            <div className="catalogos-grupos-list__items" role="listbox" aria-label="Gestiones">
                {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="catalogos-grupos-list__skeleton">
                              <Skeleton.Input active size="small" style={{ width: '100%' }} />
                          </div>
                      ))
                    : gestiones.map((gestion) => {
                          const isSelected = selectedId === gestion.id
                          const title =
                              gestion.literal || `Gestión ${gestion.gestion}`
                          const dateRange = formatDateRange(
                              gestion.fechaInicio,
                              gestion.fechaFin,
                          )

                          return (
                              <div
                                  key={gestion.id}
                                  role="option"
                                  aria-selected={isSelected}
                                  tabIndex={0}
                                  className={[
                                      'catalogos-grupos-list__item',
                                      isSelected
                                          ? 'catalogos-grupos-list__item--selected'
                                          : '',
                                  ]
                                      .filter(Boolean)
                                      .join(' ')}
                                  onClick={() => onSelect(gestion)}
                                  onKeyDown={(event) => {
                                      if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault()
                                          onSelect(gestion)
                                      }
                                  }}
                              >
                                  <Tooltip
                                      title={`${title} · ${dateRange}`}
                                      placement="right"
                                      mouseEnterDelay={0.4}
                                  >
                                      <div className="catalogos-grupos-list__item-content">
                                          <Flex
                                              align="center"
                                              gap={8}
                                              justify="space-between"
                                          >
                                              <Text
                                                  strong
                                                  className="catalogos-grupos-list__item-title"
                                              >
                                                  {title}
                                              </Text>
                                              <StatusBadge
                                                  active={gestion.activa}
                                                  activeLabel="Activa"
                                                  inactiveLabel="Inactiva"
                                                  className="catalogos-grupos-list__status"
                                              />
                                          </Flex>
                                          <Flex gap={8} align="center" wrap="wrap">
                                              <Text
                                                  type="secondary"
                                                  className="catalogos-grupos-list__item-code"
                                              >
                                                  {gestion.gestion}
                                              </Text>
                                              <Text
                                                  type="secondary"
                                                  className="catalogos-grupos-list__item-code"
                                              >
                                                  {dateRange}
                                              </Text>
                                          </Flex>
                                      </div>
                                  </Tooltip>

                                  <Flex
                                      gap={4}
                                      className="catalogos-grupos-list__item-actions"
                                      onClick={stopPropagation}
                                      onKeyDown={stopPropagation}
                                  >
                                      <Button
                                          type="text"
                                          size="small"
                                          icon={<EditOutlined />}
                                          aria-label={`Editar gestión ${gestion.gestion}`}
                                          onClick={() => onEdit(gestion)}
                                      />
                                      <Popconfirm
                                          title="Eliminar gestión"
                                          description="También se eliminarán sus periodos. ¿Continuar?"
                                          okText="Eliminar"
                                          cancelText="Cancelar"
                                          okButtonProps={{ danger: true }}
                                          onConfirm={() => onDelete(gestion)}
                                      >
                                          <Button
                                              type="text"
                                              size="small"
                                              danger
                                              icon={<DeleteOutlined />}
                                              loading={deletingId === gestion.id}
                                              aria-label={`Eliminar gestión ${gestion.gestion}`}
                                          />
                                      </Popconfirm>
                                  </Flex>
                              </div>
                          )
                      })}
            </div>

            <Pagination
                size="small"
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={onPageChange}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                className="catalogos-grupos-list__pagination"
            />
        </div>
    )
}
