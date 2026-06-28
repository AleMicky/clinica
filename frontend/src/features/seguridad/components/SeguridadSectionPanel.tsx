import { Button, Flex, Input, Typography, theme } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

type SeguridadSectionPanelProps = {
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

export function SeguridadSectionPanel({
    title,
    caption,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    onSearch,
    actionLabel,
    onAction,
    children,
}: SeguridadSectionPanelProps) {
    const { token } = theme.useToken()

    return (
        <div className="seguridad-section-panel">
            <div className="seguridad-section-panel__head">
                <div className="seguridad-section-panel__head-text">
                    <Text strong className="seguridad-section-panel__title">
                        {title}
                    </Text>
                    <Text type="secondary" className="seguridad-section-panel__caption">
                        {caption}
                    </Text>
                </div>

                <Flex gap={8} align="center" className="seguridad-section-panel__actions">
                    <Input
                        allowClear
                        size="small"
                        prefix={
                            <SearchOutlined style={{ color: token.colorTextQuaternary }} />
                        }
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                        onPressEnter={() => onSearch(searchValue)}
                        onClear={() => {
                            onSearchChange('')
                            onSearch('')
                        }}
                        className="seguridad-section-panel__search"
                    />
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </Flex>
            </div>

            <div className="seguridad-section-panel__body">{children}</div>
        </div>
    )
}
