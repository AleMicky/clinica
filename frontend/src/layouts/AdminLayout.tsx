import { Drawer, Grid, Layout, theme } from 'antd'
import { Outlet } from '@tanstack/react-router'

import { AppHeader } from '../shared/components/ui/header/AppHeader'
import {
    AppSidebar,
    SIDEBAR_COLLAPSED_WIDTH,
    SIDEBAR_WIDTH,
} from '../shared/components/ui/sidebar/AppSidebar'
import { useSidebarPersistence } from '../shared/components/ui/sidebar/useSidebarPersistence'

const { Content } = Layout
const { useBreakpoint } = Grid

export function AdminLayout() {
    const screens = useBreakpoint()
    const isMobile = !screens.lg
    const { collapsed, setCollapsed, toggleSidebar } = useSidebarPersistence(isMobile)
    const { token } = theme.useToken()

    const closeMobileSidebar = () => setCollapsed(true)

    const mainOffset = isMobile
        ? 0
        : collapsed
          ? SIDEBAR_COLLAPSED_WIDTH
          : SIDEBAR_WIDTH

    return (
        <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <AppSidebar
                    collapsed={collapsed}
                    isMobile={false}
                    onToggleSidebar={toggleSidebar}
                />
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    open={!collapsed}
                    onClose={closeMobileSidebar}
                    size={280}
                    className="admin-drawer"
                    styles={{
                        body: { padding: 0 },
                        header: { display: 'none' },
                    }}
                >
                    <AppSidebar
                        collapsed={false}
                        isMobile
                        onNavigate={closeMobileSidebar}
                        onToggleSidebar={closeMobileSidebar}
                    />
                </Drawer>
            )}

            <Layout
                className="admin-layout__main"
                style={{
                    marginLeft: mainOffset,
                    transition: 'margin-left 0.2s ease',
                }}
            >
                <AppHeader
                    collapsed={collapsed}
                    isMobile={isMobile}
                    onToggleSidebar={toggleSidebar}
                />

                <Content
                    className="admin-layout__content"
                    style={{ background: token.colorBgLayout }}
                >
                    <div className="admin-layout__content-inner">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}
