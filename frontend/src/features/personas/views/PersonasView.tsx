import { IdcardOutlined, TeamOutlined } from '@ant-design/icons'

import {
    CrudSearchFiltersBar,
    CrudSectionPanel,
} from '../../../shared/components/ui/crud-section'
import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { PersonaFormDrawer } from '../components/PersonaFormDrawer'
import { PersonasTable } from '../components/PersonasTable'
import { usePersonasView } from '../hooks/use-personas-view'

export function PersonasView() {
    const { loading, caption, totalPersonas, filters, table, formDrawer } =
        usePersonasView()

    return (
        <>
            <ModuleObjectPage
                icon={<IdcardOutlined />}
                title="Personas"
                subtitle="Registro maestro de datos personales compartido por los módulos del sistema."
                stats={[
                    {
                        icon: <TeamOutlined />,
                        label: loading ? '…' : `${totalPersonas} personas`,
                    },
                ]}
            >
                <CrudSectionPanel
                    filters={
                        <CrudSearchFiltersBar
                            searchInput={filters.searchInput}
                            hasActiveFilters={filters.hasActiveFilters}
                            onSearchInputChange={filters.onSearchInputChange}
                            onSearch={filters.onSearch}
                            onClearFilters={filters.onClearFilters}
                            ariaLabel="Filtros de personas"
                            searchAriaLabel="Buscar persona"
                            placeholder="Buscar por documento o nombre…"
                        />
                    }
                    actions={null}
                    caption={caption}
                >
                    <PersonasTable
                        personas={table.personas}
                        loading={loading}
                        total={table.total}
                        page={table.page}
                        pageSize={table.pageSize}
                        onPageChange={table.onPageChange}
                        onEdit={table.onEdit}
                        hasActiveFilters={filters.hasActiveFilters}
                        className="rrhh-empleados__table"
                    />
                </CrudSectionPanel>
            </ModuleObjectPage>

            <PersonaFormDrawer
                open={formDrawer.open}
                persona={formDrawer.persona}
                loading={formDrawer.isSaving}
                onClose={formDrawer.closeDrawer}
                onSubmit={formDrawer.handleSubmit}
            />
        </>
    )
}
