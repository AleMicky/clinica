import type { ComponentType, CSSProperties } from 'react'
import {
    AlertOutlined,
    ApartmentOutlined,
    ExperimentOutlined,
    HeartOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

export type TipoAtencionIconOption = {
    value: string
    label: string
    Icon: ComponentType<{ style?: CSSProperties; className?: string }>
}

export const TIPO_ATENCION_ICON_OPTIONS: TipoAtencionIconOption[] = [
    { value: 'MedicineBoxOutlined', label: 'Medicina', Icon: MedicineBoxOutlined },
    { value: 'AlertOutlined', label: 'Alerta', Icon: AlertOutlined },
    { value: 'HomeOutlined', label: 'Internación', Icon: HomeOutlined },
    { value: 'HeartOutlined', label: 'Corazón', Icon: HeartOutlined },
    { value: 'UserOutlined', label: 'Paciente', Icon: UserOutlined },
    { value: 'TeamOutlined', label: 'Equipo', Icon: TeamOutlined },
    { value: 'ExperimentOutlined', label: 'Laboratorio', Icon: ExperimentOutlined },
    { value: 'SolutionOutlined', label: 'Consulta', Icon: SolutionOutlined },
    { value: 'ApartmentOutlined', label: 'Área', Icon: ApartmentOutlined },
]

const iconByValue = new Map(
    TIPO_ATENCION_ICON_OPTIONS.map((option) => [option.value, option]),
)

export function getTipoAtencionIcon(icono?: string | null) {
    if (!icono) return MedicineBoxOutlined
    return iconByValue.get(icono)?.Icon ?? MedicineBoxOutlined
}

export const DEFAULT_TIPO_ATENCION_COLOR = '#1677ff'
export const DEFAULT_TIPO_ATENCION_ICONO = 'MedicineBoxOutlined'
