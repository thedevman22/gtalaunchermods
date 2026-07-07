#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const required = [
  { path: 'build/icon.ico', label: 'Windows app icon' },
  { path: 'resources/dependencies/ScriptHookV.dll', label: 'ScriptHookV.dll' },
  { path: 'resources/dependencies/dinput8.dll', label: 'dinput8.dll' }
]

const missing = required.filter(({ path }) => !existsSync(join(root, path)))

if (missing.length > 0) {
  console.error('Packaging prerequisites missing:')
  for (const item of missing) {
    console.error(`  - ${item.label} (${item.path})`)
  }
  console.error('\nAdd the missing files, then re-run npm run build:win')
  process.exit(1)
}

console.log('Packaging prerequisites OK')
