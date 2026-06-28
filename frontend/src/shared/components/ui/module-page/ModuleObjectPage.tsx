import { Flex, Grid, Typography } from 'antd'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

export type ModuleStat = {
    icon: React.ReactNode
    label: React.ReactNode
}

export type ModuleActiveSection = {
    icon: React.ReactNode
    title: string
}

type ModuleObjectPageProps = {
    icon: React.ReactNode
    title: string
    subtitle: string
    stats?: ModuleStat[]
    activeSection?: ModuleActiveSection | null
    children: React.ReactNode
}

export function ModuleObjectPage({
    icon,
    title,
    subtitle,
    stats = [],
    activeSection,
    children,
}: ModuleObjectPageProps) {
    const screens = useBreakpoint()
    const isStacked = !screens.lg

    return (
        <div className="module-object-page">
            <header className="module-object-page__header">
                <Flex
                    justify="space-between"
                    align={isStacked ? 'flex-start' : 'center'}
                    gap={16}
                    wrap="wrap"
                >
                    <Flex align="center" gap={16} className="module-object-page__header-main">
                        <div className="module-object-page__header-icon" aria-hidden>
                            {icon}
                        </div>
                        <div>
                            <Title level={3} className="module-object-page__title">
                                {title}
                            </Title>
                            <Text type="secondary" className="module-object-page__subtitle">
                                {subtitle}
                            </Text>
                        </div>
                    </Flex>

                    <Flex gap={12} wrap="wrap" align="center">
                        {stats.length > 0 ? (
                            <Flex gap={8} wrap="wrap" className="module-object-page__stats">
                                {stats.map((stat, index) => (
                                    <span
                                        key={index}
                                        className="module-object-page__stat"
                                    >
                                        {stat.icon}
                                        {stat.label}
                                    </span>
                                ))}
                            </Flex>
                        ) : null}

                        {activeSection ? (
                            <div className="module-object-page__section-badge">
                                <span
                                    className="module-object-page__section-badge-icon"
                                    aria-hidden
                                >
                                    {activeSection.icon}
                                </span>
                                <div className="module-object-page__section-badge-content">
                                    <Text
                                        type="secondary"
                                        className="module-object-page__section-badge-label"
                                    >
                                        Sección activa
                                    </Text>
                                    <Text
                                        strong
                                        className="module-object-page__section-badge-title"
                                    >
                                        {activeSection.title}
                                    </Text>
                                </div>
                            </div>
                        ) : null}
                    </Flex>
                </Flex>
            </header>

            <div className="module-object-page__workspace">
                <section className="module-object-page__content">{children}</section>
            </div>
        </div>
    )
}
