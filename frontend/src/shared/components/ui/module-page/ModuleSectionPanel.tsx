import { useEffect, useRef } from 'react'
import { Button, Grid, Input, Typography, theme } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Text } = Typography
const { useBreakpoint } = Grid

type ModuleSectionPanelProps = {
    title: string
    caption: React.ReactNode
    searchPlaceholder: string
    searchValue: string
    onSearchChange: (value: string) => void
    onSearch: (value: string) => void
    actionLabel: string
    onAction: () => void
    children: React.ReactNode
}

export function ModuleSectionPanel({
    title,
    caption,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    onSearch,
    actionLabel,
    onAction,
    children,
}: ModuleSectionPanelProps) {
    const { token } = theme.useToken()
    const screens = useBreakpoint()
    const isMobile = !screens.md
    const onSearchRef = useRef(onSearch)
    onSearchRef.current = onSearch

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchValue.trim())
        }, 400)

        return () => window.clearTimeout(timer)
    }, [searchValue])

    return (
        <div className="module-section-panel">
            <div className="module-section-panel__header">
                <div className="module-section-panel__header-text">
                    <Text strong className="module-section-panel__title">
                        {title}
                    </Text>
                    <Text type="secondary" className="module-section-panel__caption">
                        {caption}
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block={isMobile}
                    className="module-section-panel__action"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            </div>

            <div className="module-section-panel__search">
                <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onPressEnter={() => onSearch(searchValue)}
                    onClear={() => {
                        onSearchChange('')
                        onSearch('')
                    }}
                />
            </div>

            <div className="module-section-panel__body">{children}</div>
        </div>
    )
}
