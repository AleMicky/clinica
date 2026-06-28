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

const SIDEBAR_BG = '#152032'

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
            >
                <div
                    className="admin-sidebar__brand-icon"
                    style={{ background: token.colorPrimary }}
                >
                    <MedicineBoxOutlined />
                </div>

                {showBrandText && (
                    <div className="admin-sidebar__brand-text">
                        <Text strong className="admin-sidebar__brand-name">
                            Clínica ERP
                        </Text>
                        <Text className="admin-sidebar__brand-tagline">
                            Gestión hospitalaria
                        </Text>
                    </div>
                )}
            </Flex>

            <div className="admin-sidebar__menu-wrap">
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
            </div>

            {showBrandText && (
                <div className="admin-sidebar__footer">
                    <Text className="admin-sidebar__footer-version">v1.0 · Clínica ERP</Text>
                </div>
            )}
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
            width={248}
            collapsedWidth={64}
            collapsed={isCollapsed}
            trigger={null}
            style={{
                background: SIDEBAR_BG,
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
