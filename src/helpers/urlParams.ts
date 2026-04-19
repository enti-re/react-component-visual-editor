export const getComponentIdFromUrl = (): string | null =>
  new URLSearchParams(window.location.search).get('id')

export const setComponentIdInUrl = (id: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.set('id', id)
  window.history.replaceState(null, '', url.toString())
}

export const removeComponentIdFromUrl = (): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete('id')
  window.history.replaceState(null, '', url.toString())
}
