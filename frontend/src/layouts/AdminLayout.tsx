import { useEffect, useState } from 'react'
import { Drawer, Grid, Layout, theme } from 'antd'
import { Outlet } from '@tanstack/react-router'

import { AppHeader } from '../shared/components/ui/header/AppHeader'
import { AppSidebar } from '../shared/components/ui/sidebar/AppSidebar'

const { Content } = Layout
const { useBreakpoint } = Grid

export function AdminLayout() {
    const screens = useBreakpoint()
    const isMobile = !screens.lg
    const [collapsed, setCollapsed] = useState(false)
    const { token } = theme.useToken()

    useEffect(() => {
        setCollapsed(isMobile)
    }, [isMobile])

    const toggleSidebar = () => setCollapsed((prev) => !prev)
    const closeMobileSidebar = () => setCollapsed(true)

    return (
        <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <AppSidebar collapsed={collapsed} isMobile={false} />
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    open={!collapsed}
                    onClose={closeMobileSidebar}
                    width={280}
                    className="admin-drawer"
                    styles={{
                        body: { padding: 0, background: '#0f172a' },
                        header: { display: 'none' },
                    }}
                >
                    <AppSidebar
                        collapsed={false}
                        isMobile
                        onNavigate={closeMobileSidebar}
                    />
                </Drawer>
            )}

            <Layout className="admin-layout__main">
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
