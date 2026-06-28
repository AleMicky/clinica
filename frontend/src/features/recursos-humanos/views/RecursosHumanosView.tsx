import { Col, Flex, Grid, Row, Typography } from 'antd'
import { MedicineBoxOutlined, SolutionOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { RrhhSidebar } from '../components/RrhhSidebar'
import { useEmpleados } from '../hooks/empleados.hooks'
import { useMedicos } from '../hooks/medicos.hooks'

const { Text } = Typography
const { useBreakpoint } = Grid

export function RecursosHumanosView() {
    const screens = useBreakpoint()
    const isMobile = !screens.md

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
                            Empleados y médicos del hospital
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

            {isMobile ? <RrhhSidebar variant="tabs" /> : null}

            <div className="erp-object-page__workspace">
                <Row gutter={[0, 0]} className="erp-object-page__layout">
                    {!isMobile ? (
                        <Col xs={24} lg={5} xl={4}>
                            <RrhhSidebar />
                        </Col>
                    ) : null}

                    <Col xs={24} lg={isMobile ? 24 : 19} xl={isMobile ? 24 : 20}>
                        <section className="erp-object-page__content">
                            <Outlet />
                        </section>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
