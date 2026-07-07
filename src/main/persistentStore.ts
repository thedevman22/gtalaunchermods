import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export class PersistentStore<T extends Record<string, unknown>> {
  private readonly filePath: string
  private data: T

  constructor(name: string, defaults: T) {
    const dir = app.getPath('userData')
    mkdirSync(dir, { recursive: true })
    this.filePath = join(dir, `${name}.json`)
    this.data = { ...defaults, ...this.readFile() }
  }

  private readFile(): Partial<T> {
    if (!existsSync(this.filePath)) {
      return {}
    }

    try {
      return JSON.parse(readFileSync(this.filePath, 'utf-8')) as Partial<T>
    } catch {
      return {}
    }
  }

  private writeFile(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  get<K extends keyof T>(key: K, fallback?: T[K]): T[K] {
    const value = this.data[key]
    if (value === undefined && fallback !== undefined) {
      return fallback
    }
    return value
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value
    this.writeFile()
  }
}
