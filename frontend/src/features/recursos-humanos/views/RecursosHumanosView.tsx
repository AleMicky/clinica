import { Flex, Typography } from 'antd'
import { MedicineBoxOutlined, SolutionOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { useEmpleados } from '../hooks/empleados.hooks'
import { useMedicos } from '../hooks/medicos.hooks'

const { Text } = Typography

export function RecursosHumanosView() {
    const { data: empleadosData, isFetching: loadingEmpleados } = useEmpleados({
        page: 1,
        pageSize: 1,
    })
    const { data: medicosData, isFetching: loadingMedicos } = useMedicos({
        page: 1,
        pageSize: 1,
    })

    const totalEmpleados = empleadosData?.totalRecords ?? 0
    const totalMedicos = medicosData?.totalRecords ?? 0

    return (
        <div className="erp-object-page">
            <header className="erp-object-page__header">
                <Flex align="center" gap={10} className="erp-object-page__header-main">
                    <div className="erp-object-page__header-icon" aria-hidden>
                        <SolutionOutlined />
                    </div>
                    <div>
                        <Text strong className="erp-object-page__title">
                            Recursos Humanos
                        </Text>
                        <Text type="secondary" className="erp-object-page__subtitle">
                            Personal, estructura organizacional y catálogos del hospital
                        </Text>
                    </div>
                </Flex>

                <Flex gap={12} wrap="wrap" className="erp-object-page__stats">
                    <span className="erp-object-page__stat">
                        <SolutionOutlined />
                        {loadingEmpleados ? '…' : `${totalEmpleados} empleados`}
                    </span>
                    <span className="erp-object-page__stat">
                        <MedicineBoxOutlined />
                        {loadingMedicos ? '…' : `${totalMedicos} médicos`}
                    </span>
                </Flex>
            </header>

            <div className="erp-object-page__workspace">
                <section className="erp-object-page__content">
                    <Outlet />
                </section>
            </div>
        </div>
    )
}
