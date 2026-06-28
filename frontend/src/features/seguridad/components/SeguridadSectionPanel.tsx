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
        <div className="erp-list-report">
            <div className="erp-list-report__object-header">
                <Text strong className="erp-list-report__title">
                    {title}
                </Text>
                <Text type="secondary" className="erp-list-report__caption">
                    {caption}
                </Text>
            </div>

            <div className="erp-list-report__toolbar">
                <Flex gap={8} align="center" className="erp-list-report__toolbar-actions">
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </Flex>

                <Input
                    allowClear
                    size="small"
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onPressEnter={() => onSearch(searchValue)}
                    onClear={() => {
                        onSearchChange('')
                        onSearch('')
                    }}
                    className="erp-list-report__search"
                />
            </div>

            <div className="erp-list-report__content">{children}</div>
        </div>
    )
}
