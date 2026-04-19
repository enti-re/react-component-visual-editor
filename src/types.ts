export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type PanelSide = 'left' | 'right'

export interface SaveState {
  status: SaveStatus
  isDirty: boolean
  savedCode: string
}

export interface PanelState {
  codeWidth: number
  propsWidth: number
  codeCollapsed: boolean
  propsCollapsed: boolean
}

export interface ComponentMeta {
  id: string | null
  name: string
}

export interface InitialComponent {
  code: string
  id: string | null
}

export interface SelectedNode {
  id: string
  tag: string
  text?: string
  props: Record<string, string>
  style: Record<string, string>
}
