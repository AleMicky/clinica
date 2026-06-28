import { Flex, Layout, Menu, theme, Typography } from 'antd'
import { MedicineBoxOutlined } from '@ant-design/icons'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { authStore } from '../../../../stores/auth.store'
import {
    buildFlatMenuItems,
    buildMenuItems,
    findMenuItemByKey,
    getSelectedMenuKey,
} from './menu-items'

const { Sider } = Layout
const { Text } = Typography

type SidebarContentProps = {
    collapsed: boolean
    showBrandText: boolean
    onNavigate?: () => void
}

function SidebarContent({ collapsed, showBrandText, onNavigate }: SidebarContentProps) {
    const navigate = useNavigate()
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const userRoles = authStore((state) => state.user?.roles ?? [])
    const { token } = theme.useToken()

    const selectedKeys = [getSelectedMenuKey(pathname, userRoles)]

    const handleMenuClick = ({ key }: { key: string }) => {
        const item = findMenuItemByKey(key, userRoles)

        if (!item?.to) return

        navigate({ to: item.to })
        onNavigate?.()
    }

    return (
        <>
            <Flex
                align="center"
                justify={collapsed ? 'center' : 'flex-start'}
                gap={12}
                className="admin-sidebar__brand"
                style={{
                    height: 64,
                    paddingInline: collapsed ? 0 : 20,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <div
                    className="admin-sidebar__brand-icon"
                    style={{
                        background: `linear-gradient(135deg, ${token.colorPrimary}, #0958d9)`,
                    }}
                >
                    <MedicineBoxOutlined />
                </div>

                {showBrandText && (
                    <div className="admin-sidebar__brand-text">
                        <Text strong style={{ color: '#fff', fontSize: 15 }}>
                            Hospital Admin
                        </Text>
                        <Text
                            style={{
                                display: 'block',
                                color: 'rgba(255, 255, 255, 0.55)',
                                fontSize: 12,
                                lineHeight: 1.3,
                            }}
                        >
                            Panel clínico
                        </Text>
                    </div>
                )}
            </Flex>

            <Menu
                theme="dark"
                mode="inline"
                inlineCollapsed={collapsed}
                selectedKeys={selectedKeys}
                items={
                    collapsed
                        ? buildFlatMenuItems(userRoles)
                        : buildMenuItems(userRoles)
                }
                className="admin-sidebar__menu"
                style={{ background: 'transparent', borderInlineEnd: 0 }}
                onClick={handleMenuClick}
            />
        </>
    )
}

type AppSidebarProps = {
    collapsed: boolean
    isMobile: boolean
    onNavigate?: () => void
}

export function AppSidebar({ collapsed, isMobile, onNavigate }: AppSidebarProps) {
    const isCollapsed = collapsed && !isMobile
    const showBrandText = !isCollapsed

    if (isMobile) {
        return (
            <div className="admin-sidebar admin-sidebar--drawer">
                <SidebarContent
                    collapsed={false}
                    showBrandText
                    onNavigate={onNavigate}
                />
            </div>
        )
    }

    return (
        <Sider
            className={`admin-sidebar${isCollapsed ? ' admin-sidebar--collapsed' : ''}`}
            theme="dark"
            width={260}
            collapsedWidth={72}
            collapsed={isCollapsed}
            trigger={null}
            style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            }}
        >
            <SidebarContent
                collapsed={isCollapsed}
                showBrandText={showBrandText}
                onNavigate={onNavigate}
            />
        </Sider>
    )
}
