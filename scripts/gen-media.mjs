// Generates a spoken "video resume" soundtrack (.m4a) and matching captions (.vtt)
// for every candidate, using macOS `say` + `afconvert`. Run: npm run media
// The transcript shown in the modal is parsed from the same .vtt cues.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const candidates = JSON.parse(readFileSync(join(root, 'src/data/candidates.json'), 'utf8'))
const outDir = join(root, 'public/media')
const tmp = mkdtempSync(join(tmpdir(), 'rr-media-'))

const RATE = 22050
const GAP = 0.45 // seconds of silence between sentences
const LEAD = 0.3

// Read the PCM data chunk out of a WAV file written by `say`
function pcm(file) {
  const buf = readFileSync(file)
  let off = 12
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4)
    const size = buf.readUInt32LE(off + 4)
    if (id === 'data') return buf.subarray(off + 8, off + 8 + size)
    off += 8 + size + (size % 2)
  }
  throw new Error('no data chunk in ' + file)
}

function wav(data) {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22)
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(data.length, 40)
  return Buffer.concat([h, data])
}

const ts = (s) => {
  const m = Math.floor(s / 60)
  const sec = (s - m * 60).toFixed(3).padStart(6, '0')
  return `00:${String(m).padStart(2, '0')}:${sec}`
}
const silence = (s) => Buffer.alloc(Math.round(s * RATE) * 2)

const durations = {}
for (const c of candidates) {
  const parts = [silence(LEAD)]
  const cues = []
  let t = LEAD
  c.transcript.forEach((line, i) => {
    const f = join(tmp, `${c.id}-${i}.wav`)
    execFileSync('say', ['-v', c.voice, '-r', '175', '-o', f, `--data-format=LEI16@${RATE}`, line])
    const d = pcm(f)
    const len = d.length / 2 / RATE
    cues.push({ start: t, end: t + len, text: line })
    parts.push(d, silence(GAP))
    t += len + GAP
  })
  const full = join(tmp, `${c.id}.wav`)
  writeFileSync(full, wav(Buffer.concat(parts)))
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', full, join(outDir, `${c.id}.m4a`)])
  const vtt = 'WEBVTT\n\n' + cues.map((q, i) => `${i + 1}\n${ts(q.start)} --> ${ts(q.end)}\n${q.text}\n`).join('\n')
  writeFileSync(join(outDir, `${c.id}.vtt`), vtt)
  durations[c.id] = Math.round(t * 10) / 10
  console.log(c.id, durations[c.id] + 's')
}
writeFileSync(join(root, 'src/data/media.json'), JSON.stringify(durations, null, 2) + '\n')
rmSync(tmp, { recursive: true, force: true })
