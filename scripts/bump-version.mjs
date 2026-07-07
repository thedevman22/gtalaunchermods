#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const landingConfigPath = join(root, 'landing/src/config/download.ts')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)
const nextVersion = `${major}.${minor}.${patch + 1}`

pkg.version = nextVersion
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

let landingConfig = readFileSync(landingConfigPath, 'utf8')
landingConfig = landingConfig.replace(
  /const VERSION = '[^']+'/,
  `const VERSION = '${nextVersion}'`
)
writeFileSync(landingConfigPath, landingConfig)

console.log(nextVersion)
