import { Select } from 'antd'

import { useWorkflowEmployeeOptions } from '../hooks/useWorkflowLookups'

type WorkflowEmployeeSelectProps = {
    value?: string | string[] | null
    onChange: (value: string | string[]) => void
    mode?: 'multiple'
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
}

export function WorkflowEmployeeSelect({
    value,
    onChange,
    mode,
    placeholder = 'Seleccione empleado',
    disabled,
    allowClear,
}: WorkflowEmployeeSelectProps) {
    const { options, loading } = useWorkflowEmployeeOptions()

    if (mode === 'multiple') {
        return (
            <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                allowClear={allowClear}
                disabled={disabled}
                loading={loading}
                placeholder={placeholder}
                options={options}
                value={(value as string[] | null | undefined) ?? []}
                onChange={(next) => onChange(next)}
                maxTagCount="responsive"
            />
        )
    }

    return (
        <Select
            showSearch
            optionFilterProp="label"
            allowClear={allowClear}
            disabled={disabled}
            loading={loading}
            placeholder={placeholder}
            options={options}
            value={(value as string | null | undefined) || undefined}
            onChange={(next) => onChange(next ?? '')}
        />
    )
}
