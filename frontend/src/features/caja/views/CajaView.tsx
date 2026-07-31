import { DollarOutlined } from '@ant-design/icons'
import { Outlet, useRouterState } from '@tanstack/react-router'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { useCuentas, useTurnoAbierto } from '../hooks/caja.hooks'

export function CajaView() {
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const { data: turno } = useTurnoAbierto()
    const { data, isFetching } = useCuentas({ page: 1, pageSize: 1, estado: 'ABIERTA' })
    const totalAbiertas = data?.totalRecords ?? 0

    const activeSection = (() => {
        if (pathname.includes('/caja/cuentas/') && pathname !== '/caja/cuentas') {
            return { icon: <DollarOutlined />, title: 'Detalle de cuenta' }
        }
        if (pathname.startsWith('/caja/cuentas')) {
            return { icon: <DollarOutlined />, title: 'Bandeja de cobros' }
        }
        if (pathname.startsWith('/caja/turnos')) {
            return { icon: <DollarOutlined />, title: 'Turnos de caja' }
        }
        if (pathname.startsWith('/caja/pagos')) {
            return { icon: <DollarOutlined />, title: 'Pagos' }
        }
        if (pathname.startsWith('/caja/movimientos')) {
            return { icon: <DollarOutlined />, title: 'Movimientos' }
        }
        if (pathname.startsWith('/caja/cajas')) {
            return { icon: <DollarOutlined />, title: 'Administración de cajas' }
        }
        if (pathname.startsWith('/caja/metodos-pago')) {
            return { icon: <DollarOutlined />, title: 'Métodos de pago' }
        }
        if (pathname.startsWith('/caja/conceptos')) {
            return { icon: <DollarOutlined />, title: 'Conceptos de caja' }
        }
        return { icon: <DollarOutlined />, title: 'Operación' }
    })()

    return (
        <div className="caja-module">
            <ModuleObjectPage
                icon={<DollarOutlined />}
                title="Caja"
                subtitle="Operación de cobros y turnos"
                stats={[
                    {
                        icon: <DollarOutlined />,
                        label: turno
                            ? `Turno abierto · ${turno.cajaCodigo}`
                            : 'Sin turno abierto',
                    },
                    {
                        icon: <DollarOutlined />,
                        label: isFetching ? '…' : `${totalAbiertas} cuentas abiertas`,
                    },
                ]}
                activeSection={activeSection}
            >
                <Outlet />
            </ModuleObjectPage>
        </div>
    )
}
