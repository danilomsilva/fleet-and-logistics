export function formatKm(value: number): string {
  const withDots = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withDots} Km`
}
