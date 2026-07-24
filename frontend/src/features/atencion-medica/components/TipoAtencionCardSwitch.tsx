import type { CSSProperties } from 'react'
import { Spin, Typography } from 'antd'

import {
    DEFAULT_TIPO_ATENCION_COLOR,
    getTipoAtencionIcon,
} from '../constants/tipo-atencion-icons'
import type { TipoAtencion } from '../types/atencion-medica.types'

const { Text } = Typography

type TipoAtencionCardSwitchProps = {
    tipos: TipoAtencion[]
    value?: string
    onChange: (tipoId: string) => void
    onBlur?: () => void
    disabled?: boolean
    loading?: boolean
    error?: string
}

function hexToRgba(hex: string, alpha: number) {
    const normalized = hex.replace('#', '').trim()
    const full =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((char) => `${char}${char}`)
                  .join('')
            : normalized

    if (!/^[0-9a-fA-F]{6}$/.test(full)) {
        return `rgba(22, 119, 255, ${alpha})`
    }

    const r = Number.parseInt(full.slice(0, 2), 16)
    const g = Number.parseInt(full.slice(2, 4), 16)
    const b = Number.parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function TipoAtencionCardSwitch({
    tipos,
    value,
    onChange,
    onBlur,
    disabled = false,
    loading = false,
    error,
}: TipoAtencionCardSwitchProps) {
    if (loading && tipos.length === 0) {
        return (
            <div className="tipo-atencion-switch tipo-atencion-switch--loading">
                <Spin size="small" />
                <Text type="secondary">Cargando tipos de atención…</Text>
            </div>
        )
    }

    if (!loading && tipos.length === 0) {
        return (
            <div className="tipo-atencion-switch tipo-atencion-switch--empty">
                <Text type="secondary">No hay tipos de atención disponibles</Text>
            </div>
        )
    }

    return (
        <div
            className={[
                'tipo-atencion-switch',
                error ? 'tipo-atencion-switch--error' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            role="radiogroup"
            aria-label="Tipo de atención"
            onBlur={onBlur}
        >
            {tipos.map((tipo) => {
                const selected = value === tipo.id
                const color = tipo.color || DEFAULT_TIPO_ATENCION_COLOR
                const Icon = getTipoAtencionIcon(tipo.icono)
                const descripcion = tipo.descripcion?.trim() || tipo.codigo

                return (
                    <button
                        key={tipo.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled || loading}
                        className={[
                            'tipo-atencion-switch__card',
                            selected ? 'tipo-atencion-switch__card--selected' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        style={
                            {
                                '--tipo-color': color,
                                '--tipo-color-soft': hexToRgba(color, 0.1),
                                '--tipo-color-border': hexToRgba(color, selected ? 0.55 : 0.22),
                                '--tipo-color-bg': selected
                                    ? hexToRgba(color, 0.1)
                                    : '#fff',
                            } as CSSProperties
                        }
                        onClick={() => onChange(tipo.id)}
                    >
                        <span className="tipo-atencion-switch__icon" aria-hidden>
                            <Icon />
                        </span>
                        <span className="tipo-atencion-switch__text">
                            <span className="tipo-atencion-switch__name">{tipo.nombre}</span>
                            <span className="tipo-atencion-switch__desc">{descripcion}</span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
