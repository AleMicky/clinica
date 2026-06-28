import { Col, Flex, Grid, Row, Typography } from 'antd'
import { MedicineBoxOutlined, SolutionOutlined } from '@ant-design/icons'
import { Outlet } from '@tanstack/react-router'

import { RrhhSidebar } from '../components/RrhhSidebar'
import { useEmpleados } from '../hooks/empleados.hooks'
import { useMedicos } from '../hooks/medicos.hooks'

const { Title, Text } = Typography
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
        <div className="rrhh-view">
            <header className="rrhh-view__hero">
                <Flex
                    justify="space-between"
                    align="center"
                    gap={12}
                    wrap="wrap"
                    className="rrhh-view__hero-inner"
                >
                    <Flex align="center" gap={10} className="rrhh-view__hero-main">
                        <div className="rrhh-view__hero-icon" aria-hidden>
                            <SolutionOutlined />
                        </div>
                        <div>
                            <Title level={4} className="rrhh-view__title">
                                Recursos Humanos
                            </Title>
                            <Text type="secondary" className="rrhh-view__subtitle">
                                Empleados y médicos del hospital
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={8} wrap="wrap" className="rrhh-view__stats">
                        <span className="rrhh-view__stat-pill">
                            <SolutionOutlined />
                            {loadingEmpleados ? '…' : `${totalEmpleados} empleados`}
                        </span>
                        <span className="rrhh-view__stat-pill">
                            <MedicineBoxOutlined />
                            {loadingMedicos ? '…' : `${totalMedicos} médicos`}
                        </span>
                    </Flex>
                </Flex>
            </header>

            {isMobile ? <RrhhSidebar variant="tabs" /> : null}

            <div className="rrhh-view__workspace">
                <Row gutter={[12, 12]} className="rrhh-view__layout">
                    {!isMobile ? (
                        <Col xs={24} lg={6} xl={5}>
                            <RrhhSidebar />
                        </Col>
                    ) : null}

                    <Col xs={24} lg={isMobile ? 24 : 18} xl={isMobile ? 24 : 19}>
                        <section className="rrhh-view__content">
                            <Outlet />
                        </section>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
