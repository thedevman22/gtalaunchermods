/** Compare semver strings (supports optional leading "v"). Returns negative if a < b. */
export function compareSemver(a: string, b: string): number {
  const parse = (value: string): number[] =>
    value
      .replace(/^v/i, '')
      .split('.')
      .map((part) => {
        const n = Number.parseInt(part, 10)
        return Number.isFinite(n) ? n : 0
      })

  const left = parse(a)
  const right = parse(b)
  const length = Math.max(left.length, right.length)

  for (let i = 0; i < length; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff
  }

  return 0
}

export function isVersionBelow(current: string, minimum: string): boolean {
  return compareSemver(current, minimum) < 0
}
