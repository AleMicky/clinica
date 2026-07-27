import { Select } from 'antd'

import { useWorkflowAreaOptions } from '../hooks/useWorkflowLookups'

type WorkflowAreaSelectProps = {
    value?: string | null
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
}

export function WorkflowAreaSelect({
    value,
    onChange,
    placeholder = 'Seleccione un área',
    disabled,
    allowClear,
}: WorkflowAreaSelectProps) {
    const { options, loading } = useWorkflowAreaOptions()

    return (
        <Select
            showSearch
            optionFilterProp="label"
            allowClear={allowClear}
            disabled={disabled}
            loading={loading}
            placeholder={placeholder}
            options={options}
            value={value || undefined}
            onChange={(next) => onChange(next ?? '')}
        />
    )
}
