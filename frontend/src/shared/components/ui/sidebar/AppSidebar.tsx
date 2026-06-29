import { useCallback, useMemo, useState } from 'react'
import {
    Button,
    Empty,
    Flex,
    Input,
    Layout,
    theme,
    Tooltip,
    Typography,
} from 'antd'
import {
    DownOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MedicineBoxOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { authStore } from '../../../../stores/auth.store'
import { useThemeStore } from '../../../../stores/theme.store'
import {
    getFilteredMenuGroupsForUser,
    getSelectedMenuKey,
    type AppMenuItem,
} from './menu-items'
import { useSidebarSections } from './useSidebarSections'
import {
    SIDEBAR_COLLAPSED_WIDTH,
    SIDEBAR_WIDTH,
} from './useSidebarPersistence'

const { Sider } = Layout
const { Text } = Typography

export { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH }

type SidebarContentProps = {
    collapsed: boolean
    showBrandText: boolean
    onNavigate?: () => void
    onToggleSidebar?: () => void
}

function NavIcon({ icon }: { icon: React.ReactNode }) {
    return <span className="admin-sidebar__nav-icon">{icon}</span>
}

type NavItemProps = {
    item: AppMenuItem
    isActive: boolean
    onClick: (item: AppMenuItem) => void
}

function SidebarNavItem({ item, isActive, onClick }: NavItemProps) {
    const isDisabled = item.disabled ?? !item.to

    return (
        <button
            type="button"
            className={`admin-sidebar__nav-item${isActive ? ' admin-sidebar__nav-item--active' : ''}${isDisabled ? ' admin-sidebar__nav-item--disabled' : ''}`}
            disabled={isDisabled}
            title={isDisabled ? `${item.label} (próximamente)` : item.label}
            onClick={() => {
                if (isDisabled) return
                onClick(item)
            }}
        >
            <NavIcon icon={item.icon} />
            <span className="admin-sidebar__nav-label">{item.label}</span>
        </button>
    )
}

function SidebarContent({
    collapsed,
    showBrandText,
    onNavigate,
    onToggleSidebar,
}: SidebarContentProps) {
    const navigate = useNavigate()
    const pathname = useRouterState({ select: (state) => state.location.pathname })
    const userRoles = authStore((state) => state.user?.roles ?? [])
    const { token } = theme.useToken()

    const [searchQuery, setSearchQuery] = useState('')
    const isSearching = searchQuery.trim().length > 0

    const menuGroups = useMemo(
        () => getFilteredMenuGroupsForUser(userRoles, searchQuery),
        [searchQuery, userRoles],
    )

    const { standaloneGroups, collapsibleGroups } = useMemo(() => {
        const standalone: typeof menuGroups = []
        const collapsible: typeof menuGroups = []

        for (const group of menuGroups) {
            if (group.items.length === 1) {
                standalone.push(group)
            } else {
                collapsible.push(group)
            }
        }

        return { standaloneGroups: standalone, collapsibleGroups: collapsible }
    }, [menuGroups])

    const selectedKey = getSelectedMenuKey(pathname, userRoles)
    const { openSections, toggleSection, ensureSectionOpen } = useSidebarSections(
        collapsibleGroups,
        pathname,
        userRoles,
        isSearching,
    )

    const flatItems = useMemo(
        () =>
            menuGroups.flatMap((group, groupIndex) =>
                group.items.map((item, itemIndex) => ({
                    item,
                    isGroupStart:
                        groupIndex > 0 &&
                        itemIndex === 0 &&
                        group.items.length > 1,
                })),
            ),
        [menuGroups],
    )

    const handleItemNavigate = useCallback(
        (item: AppMenuItem) => {
            if (!item.to) return

            const parentGroup = collapsibleGroups.find((group) =>
                group.items.some((entry) => entry.key === item.key),
            )

            if (parentGroup) {
                ensureSectionOpen(parentGroup.key)
            }

            navigate({ to: item.to })
            onNavigate?.()
        },
        [collapsibleGroups, ensureSectionOpen, navigate, onNavigate],
    )

    const collapseItems = useMemo(
        () =>
            collapsibleGroups.map((group, index) => {
                const isOpen = openSections.includes(group.key)

                return (
                    <div
                        key={group.key}
                        className={
                            index < collapsibleGroups.length - 1
                                ? 'admin-sidebar__section admin-sidebar__section--divider'
                                : 'admin-sidebar__section'
                        }
                    >
                        <button
                            type="button"
                            className={`admin-sidebar__section-header${isOpen ? ' admin-sidebar__section-header--open' : ''}`}
                            aria-expanded={isOpen}
                            onClick={() => toggleSection(group.key)}
                        >
                            <span className="admin-sidebar__section-title">
                                {group.label}
                            </span>
                            <DownOutlined
                                className={`admin-sidebar__section-chevron${isOpen ? ' admin-sidebar__section-chevron--open' : ''}`}
                            />
                        </button>

                        {isOpen && (
                            <div className="admin-sidebar__section-items">
                                {group.items.map((item) => (
                                    <SidebarNavItem
                                        key={item.key}
                                        item={item}
                                        isActive={item.key === selectedKey}
                                        onClick={handleItemNavigate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            }),
        [
            collapsibleGroups,
            handleItemNavigate,
            openSections,
            selectedKey,
            toggleSection,
        ],
    )

    const standaloneItems = standaloneGroups.flatMap((group) => group.items)

    return (
        <>
            <Flex
                align="center"
                justify={collapsed ? 'center' : 'flex-start'}
                gap={10}
                className="admin-sidebar__brand"
            >
                <div
                    className="admin-sidebar__brand-icon"
                    style={{ background: token.colorPrimary, color: '#fff' }}
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

            {showBrandText && (
                <div className="admin-sidebar__search">
                    <Input
                        allowClear
                        size="small"
                        value={searchQuery}
                        placeholder="Buscar módulo..."
                        prefix={
                            <SearchOutlined
                                style={{ color: token.colorTextQuaternary }}
                            />
                        }
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
            )}

            <div className="admin-sidebar__menu-wrap">
                {!collapsed && menuGroups.length === 0 && (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Sin resultados"
                        className="admin-sidebar__empty"
                    />
                )}

                {!collapsed && menuGroups.length > 0 && (
                    <>
                        {standaloneItems.length > 0 && (
                            <div
                                className={`admin-sidebar__standalone-items${collapsibleGroups.length > 0 ? ' admin-sidebar__standalone-items--with-sections' : ''}`}
                            >
                                {standaloneItems.map((item) => (
                                    <SidebarNavItem
                                        key={item.key}
                                        item={item}
                                        isActive={item.key === selectedKey}
                                        onClick={handleItemNavigate}
                                    />
                                ))}
                            </div>
                        )}

                        {collapsibleGroups.length > 0 && (
                            <div className="admin-sidebar__sections">
                                {collapseItems}
                            </div>
                        )}
                    </>
                )}

                {collapsed && (
                    <div className="admin-sidebar__collapsed-nav">
                        {flatItems.map(({ item, isGroupStart }) => {
                            const isDisabled = item.disabled ?? !item.to
                            const isActive = item.key === selectedKey

                            const button = (
                                <button
                                    type="button"
                                    key={item.key}
                                    className={`admin-sidebar__collapsed-item${isActive ? ' admin-sidebar__collapsed-item--active' : ''}${isDisabled ? ' admin-sidebar__collapsed-item--disabled' : ''}${isGroupStart ? ' admin-sidebar__collapsed-item--group-start' : ''}`}
                                    disabled={isDisabled}
                                    onClick={() => {
                                        if (isDisabled) return
                                        handleItemNavigate(item)
                                    }}
                                >
                                    <NavIcon icon={item.icon} />
                                </button>
                            )

                            return (
                                <Tooltip
                                    key={item.key}
                                    title={
                                        isDisabled
                                            ? `${item.label} (próximamente)`
                                            : item.label
                                    }
                                    placement="right"
                                >
                                    {button}
                                </Tooltip>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="admin-sidebar__footer">
                {showBrandText ? (
                    <>
                        <div className="admin-sidebar__footer-info">
                            <Text strong className="admin-sidebar__footer-name">
                                Clínica ERP
                            </Text>
                            <Text className="admin-sidebar__footer-version">
                                v1.0.0
                            </Text>
                        </div>
                        {onToggleSidebar && (
                            <Button
                                type="text"
                                size="small"
                                className="admin-sidebar__footer-toggle"
                                icon={<MenuFoldOutlined />}
                                aria-label="Contraer menú"
                                onClick={onToggleSidebar}
                            />
                        )}
                    </>
                ) : (
                    <Flex vertical align="center" gap={4}>
                        <Tooltip title="Clínica ERP v1.0.0" placement="right">
                            <div className="admin-sidebar__footer-mark">C</div>
                        </Tooltip>
                        {onToggleSidebar && (
                            <Button
                                type="text"
                                size="small"
                                className="admin-sidebar__footer-toggle"
                                icon={<MenuUnfoldOutlined />}
                                aria-label="Expandir menú"
                                onClick={onToggleSidebar}
                            />
                        )}
                    </Flex>
                )}
            </div>
        </>
    )
}

type AppSidebarProps = {
    collapsed: boolean
    isMobile: boolean
    onNavigate?: () => void
    onToggleSidebar?: () => void
}

export function AppSidebar({
    collapsed,
    isMobile,
    onNavigate,
    onToggleSidebar,
}: AppSidebarProps) {
    const isCollapsed = collapsed && !isMobile
    const showBrandText = !isCollapsed
    const isDark = useThemeStore((state) => state.isDark)

    if (isMobile) {
        return (
            <div className="admin-sidebar admin-sidebar--drawer">
                <SidebarContent
                    collapsed={false}
                    showBrandText
                    onNavigate={onNavigate}
                    onToggleSidebar={onToggleSidebar}
                />
            </div>
        )
    }

    return (
        <Sider
            className={`admin-sidebar${isCollapsed ? ' admin-sidebar--collapsed' : ''}`}
            theme={isDark ? 'dark' : 'light'}
            width={SIDEBAR_WIDTH}
            collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
            collapsed={isCollapsed}
            trigger={null}
        >
            <SidebarContent
                collapsed={isCollapsed}
                showBrandText={showBrandText}
                onNavigate={onNavigate}
                onToggleSidebar={onToggleSidebar}
            />
        </Sider>
    )
}
