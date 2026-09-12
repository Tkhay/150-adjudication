// Copies the generated ../output/awards.json into public/data/awards.json.
// public/data/awards.json is a build artifact only -- never edit it by hand,
// and never edit output/awards.json from this project either.
// Data flow: nominations.json -> prepare_awards.py -> output/awards.json -> this copy.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = join(__dirname, '..', '..', 'output', 'awards.json')
const destDir = join(__dirname, '..', 'public', 'data')
const dest = join(destDir, 'awards.json')

if (!existsSync(source)) {
  if (existsSync(dest)) {
    // e.g. a Vercel build: output/ isn't checked out, but the last synced
    // copy is committed at public/data/awards.json -- build with that.
    console.log(`${source} not found; using committed ${dest} as-is.`)
    process.exit(0)
  }
  console.error(
    `\nCould not find ${source}\nRun prepare_awards.py first to generate output/awards.json.\n`
  )
  process.exit(1)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(source, dest)
console.log(`Synced ${source} -> ${dest}`)
