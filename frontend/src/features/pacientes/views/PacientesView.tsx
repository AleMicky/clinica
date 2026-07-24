import { Button, Descriptions, Modal } from 'antd'
import { TeamOutlined } from '@ant-design/icons'

import { ModuleObjectPage } from '../../../shared/components/ui/module-page/ModuleObjectPage'
import { PacienteFormModal } from '../components/PacienteFormModal'
import { PacientesFiltersBar } from '../components/PacientesFiltersBar'
import { PacientesHeader } from '../components/PacientesHeader'
import { PacientesTable } from '../components/PacientesTable'
import { usePacientesView } from '../hooks/use-pacientes-view'
import {
    calcularEdadPaciente,
    formatPacienteDocumento,
} from '../types/paciente.types'

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('es-BO')
}

export function PacientesView() {
    const { loading, caption, totalPacientes, filters, table, formModal, fichaModal } =
        usePacientesView()

    return (
        <div className="pacientes-module">
            <ModuleObjectPage
                icon={<TeamOutlined />}
                title="Pacientes"
                subtitle="Directorio clínico y registro guiado de fichas de paciente."
                stats={[
                    {
                        icon: <TeamOutlined />,
                        label: loading ? '…' : `${totalPacientes} pacientes`,
                    },
                ]}
            >
                <div className="rrhh-section-panel rrhh-pacientes">
                    <div className="rrhh-section-panel__filters">
                        <PacientesFiltersBar
                            searchInput={filters.searchInput}
                            onSearchInputChange={filters.onSearchInputChange}
                            onSearch={filters.onSearch}
                        />
                        <PacientesHeader onCreate={formModal.openCreateModal} />
                    </div>
                    <div className="rrhh-section-panel__body">
                        <p className="rrhh-section-panel__caption rrhh-pacientes__caption">
                            {caption}
                        </p>
                        <PacientesTable
                            pacientes={table.pacientes}
                            loading={loading}
                            total={table.total}
                            page={table.page}
                            pageSize={table.pageSize}
                            onPageChange={table.onPageChange}
                            onEdit={table.onEdit}
                            onViewFicha={table.onViewFicha}
                            onNuevaAtencion={table.onNuevaAtencion}
                            onDelete={table.onDelete}
                            onCreate={table.onCreate}
                            deletingId={table.deletingId}
                            hasActiveFilters={table.hasActiveFilters}
                            className="rrhh-pacientes__table"
                        />
                    </div>
                </div>
            </ModuleObjectPage>

            <PacienteFormModal
                open={formModal.open}
                paciente={formModal.paciente}
                loading={formModal.isSaving}
                onClose={formModal.closeModal}
                onSubmit={formModal.handleSubmit}
            />

            <Modal
                title="Ficha del paciente"
                open={fichaModal.paciente !== null}
                onCancel={fichaModal.close}
                footer={[
                    <Button key="close" onClick={fichaModal.close}>
                        Cerrar
                    </Button>,
                    <Button key="edit" type="primary" onClick={fichaModal.edit}>
                        Editar
                    </Button>,
                ]}
                width={560}
                className="paciente-ficha-modal"
                destroyOnHidden
            >
                {fichaModal.paciente ? (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Historia clínica">
                            {fichaModal.paciente.numeroHistoriaClinica}
                        </Descriptions.Item>
                        <Descriptions.Item label="Paciente">
                            {fichaModal.paciente.personaNombreCompleto}
                        </Descriptions.Item>
                        <Descriptions.Item label="Documento">
                            {formatPacienteDocumento(fichaModal.paciente)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de nacimiento">
                            {formatDate(fichaModal.paciente.fechaNacimiento)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Edad">
                            {calcularEdadPaciente(fichaModal.paciente.fechaNacimiento)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sexo">
                            {fichaModal.paciente.sexoNombre || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Teléfono">
                            {fichaModal.paciente.telefono?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dirección">
                            {fichaModal.paciente.direccion?.trim() || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>
        </div>
    )
}
