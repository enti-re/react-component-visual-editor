import { useState, useEffect } from 'react'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'
type TooltipState = { text: string; kbd: string; side: string; x: number; y: number } | null

const TOOLTIP_OFFSET = 8

let tooltipSetter: ((s: TooltipState) => void) | null = null

export const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = (key: string) => IS_MAC ? `⌘${key}` : `Ctrl ${key}`

const showTooltip = (el: HTMLElement, text: string, kbd: string, side: TooltipSide) => {
  if (!tooltipSetter) return

  const elRect = el.getBoundingClientRect()
  const anchorRect = (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect() ?? elRect

  let x = elRect.left + elRect.width / 2
  let y = elRect.bottom + TOOLTIP_OFFSET

  if (side === 'right') {
    x = elRect.right + TOOLTIP_OFFSET
    y = anchorRect.top + anchorRect.height / 2
  } else if (side === 'left') {
    x = elRect.left - TOOLTIP_OFFSET
    y = anchorRect.top + anchorRect.height / 2
  } else if (side === 'top') {
    y = elRect.top - TOOLTIP_OFFSET
  }

  tooltipSetter({ text, kbd, side, x, y })
}

const hideTooltip = () => tooltipSetter?.(null)

export const tooltipHandlers = (text: string, kbd: string, side: TooltipSide = 'bottom') => ({
  onPointerEnter: (e: React.PointerEvent<HTMLElement>) => showTooltip(e.currentTarget, text, kbd, side),
  onPointerLeave: hideTooltip,
  onPointerDown: hideTooltip,
  onBlur: hideTooltip,
})

export const KbdTooltip = () => {
  const [state, setState] = useState<TooltipState>(null)

  useEffect(() => {
    tooltipSetter = setState
    return () => { tooltipSetter = null }
  }, [])

  if (!state) return null

  return (
    <div className={`kbd-tooltip kbd-tooltip--${state.side}`} style={{ top: state.y, left: state.x }}>
      <span>{state.text}</span>
      {state.kbd && <kbd>{state.kbd}</kbd>}
    </div>
  )
}
