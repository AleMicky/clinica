import { useEffect, useMemo, useState } from 'react'
import { Avatar, Empty, Flex, Pagination, Skeleton, Tag, Typography } from 'antd'
import { TeamOutlined } from '@ant-design/icons'

import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { empleadosService } from '../services/empleados.service'
import type { Empleado, EntityId } from '../types/empleado.types'

const { Text } = Typography

const PAGE_SIZE = 10

type JerarquiaEmpleadosSectionProps = {
    areaId?: EntityId | null
    departamentoId?: EntityId | null
    servicioId?: EntityId | null
    enabled?: boolean
    compactMeta?: boolean
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function EmpleadoRow({
    empleado,
    compactMeta,
}: {
    empleado: Empleado
    compactMeta: boolean
}) {
    const meta = compactMeta
        ? [empleado.cargoNombre, empleado.servicioNombre].filter(Boolean).join(' · ')
        : [empleado.cargoNombre, empleado.profesionNombre].filter(Boolean).join(' · ')

    return (
        <li className="jerarquia-explorer__empleado">
            <Avatar size={26} className="jerarquia-explorer__empleado-avatar" aria-hidden>
                {initials(empleado.personaNombreCompleto)}
            </Avatar>
            <div className="jerarquia-explorer__empleado-body">
                <Flex align="center" gap={6} wrap="nowrap" className="jerarquia-explorer__empleado-line">
                    <Text strong className="jerarquia-explorer__empleado-name" ellipsis>
                        {empleado.personaNombreCompleto}
                    </Text>
                    {empleado.esMedico ? (
                        <Tag className="jerarquia-explorer__empleado-medico-tag" variant="filled">
                            Médico
                        </Tag>
                    ) : null}
                </Flex>
                <Text type="secondary" className="jerarquia-explorer__empleado-meta" ellipsis>
                    {meta || 'Sin cargo'}
                </Text>
            </div>
            <Tag className="jerarquia-explorer__empleado-code" variant="filled">
                {empleado.codigoEmpleado}
            </Tag>
        </li>
    )
}

export function JerarquiaEmpleadosSection({
    areaId,
    departamentoId,
    servicioId,
    enabled = true,
    compactMeta = false,
}: JerarquiaEmpleadosSectionProps) {
    const [page, setPage] = useState(1)

    const selectionKey = `${areaId ?? ''}:${departamentoId ?? ''}:${servicioId ?? ''}`

    useEffect(() => {
        setPage(1)
    }, [selectionKey])

    const query = useMemo(
        () => ({
            page,
            pageSize: PAGE_SIZE,
            areaId: areaId ?? undefined,
            departamentoId: departamentoId ?? undefined,
            servicioId: servicioId ?? undefined,
        }),
        [page, areaId, departamentoId, servicioId],
    )

    const canFetch = enabled && Boolean(areaId || departamentoId || servicioId)

    const { data, isFetching } = useAppQuery({
        queryKey: queryKeys.empleados.list(query),
        queryFn: () => empleadosService.getPaged(query),
        enabled: canFetch,
    })

    const empleados = data?.items ?? []
    const total = data?.totalRecords ?? 0

    return (
        <div className="jerarquia-explorer__detail-section jerarquia-explorer__empleados-section">
            <Flex
                align="center"
                justify="space-between"
                gap={8}
                className="jerarquia-explorer__empleados-head"
            >
                <Flex align="center" gap={6}>
                    <TeamOutlined className="jerarquia-explorer__section-icon-inline" />
                    <Text strong className="jerarquia-explorer__section-title">
                        Empleados
                    </Text>
                    {canFetch && !isFetching ? (
                        <Text type="secondary" className="jerarquia-explorer__section-count">
                            {total}
                        </Text>
                    ) : null}
                </Flex>
            </Flex>

            {!canFetch ? null : isFetching && empleados.length === 0 ? (
                <div className="jerarquia-explorer__empleados-loading">
                    <Skeleton active avatar title={false} paragraph={{ rows: 1 }} />
                    <Skeleton active avatar title={false} paragraph={{ rows: 1 }} />
                    <Skeleton active avatar title={false} paragraph={{ rows: 1 }} />
                </div>
            ) : empleados.length === 0 ? (
                <div className="jerarquia-explorer__section-empty">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Sin empleados asignados"
                    />
                </div>
            ) : (
                <>
                    <ul className="jerarquia-explorer__empleados-list">
                        {empleados.map((empleado) => (
                            <EmpleadoRow
                                key={empleado.id}
                                empleado={empleado}
                                compactMeta={compactMeta}
                            />
                        ))}
                    </ul>
                    {total > PAGE_SIZE ? (
                        <div className="jerarquia-explorer__empleados-pagination">
                            <Pagination
                                size="small"
                                current={page}
                                pageSize={PAGE_SIZE}
                                total={total}
                                showSizeChanger={false}
                                onChange={setPage}
                            />
                        </div>
                    ) : null}
                </>
            )}
        </div>
    )
}
