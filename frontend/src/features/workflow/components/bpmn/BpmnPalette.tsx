import { Flex, Typography } from 'antd'

import type { BpmnPaletteKind } from '../../utils/buildWorkflowFlow'

const { Text } = Typography

export const BPMN_PALETTE_DND_TYPE = 'application/clinica-bpmn'

const PALETTE_ITEMS: Array<{
    kind: BpmnPaletteKind
    label: string
    shapeClass: string
}> = [
    { kind: 'start', label: 'Inicio', shapeClass: 'bpmn-palette__shape--start' },
    { kind: 'task', label: 'Tarea', shapeClass: 'bpmn-palette__shape--task' },
    { kind: 'end', label: 'Fin', shapeClass: 'bpmn-palette__shape--end' },
    { kind: 'gateway', label: 'Gateway XOR', shapeClass: 'bpmn-palette__shape--gateway' },
]

type BpmnPaletteProps = {
    onAddElement?: (kind: BpmnPaletteKind) => void
}

export function BpmnPalette({ onAddElement }: BpmnPaletteProps) {
    return (
        <div className="bpmn-palette">
            <div className="bpmn-palette__section">
                <Text strong className="bpmn-palette__title">
                    Elementos BPMN
                </Text>
                <Flex gap={8} wrap className="bpmn-palette__items">
                    {PALETTE_ITEMS.map((item) => (
                        <button
                            key={item.kind}
                            type="button"
                            className="bpmn-palette__item bpmn-palette__item--draggable"
                            draggable
                            title={`Arrastre al canvas o haga clic para agregar: ${item.label}`}
                            onDragStart={(event) => {
                                event.dataTransfer.setData(BPMN_PALETTE_DND_TYPE, item.kind)
                                event.dataTransfer.effectAllowed = 'move'
                            }}
                            onClick={() => onAddElement?.(item.kind)}
                        >
                            <span className={`bpmn-palette__shape ${item.shapeClass}`} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </Flex>
            </div>

            <div className="bpmn-palette__section bpmn-palette__section--hint">
                <Text type="secondary">
                    Arrastre un elemento al lienzo o haga clic para crearlo. Conecte handles para
                    crear flujos. Delete elimina la selección.
                </Text>
            </div>
        </div>
    )
}
