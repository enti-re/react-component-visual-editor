const RGB_PATTERN = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/

export const toHex = (color: string | undefined): string | undefined => {
  if (!color) return undefined
  if (color.startsWith('#')) return color
  const match = color.match(RGB_PATTERN)
  if (match) {
    return '#' + [match[1], match[2], match[3]]
      .map(n => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
  }
  return color
}
