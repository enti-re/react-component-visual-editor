export interface BadgeInfo {
  tag: string
  top: number
  left: number
}

export interface HoverInfo {
  rect: DOMRect
  badge: BadgeInfo
}
