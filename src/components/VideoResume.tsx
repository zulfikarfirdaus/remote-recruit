import { useEffect, useRef, useState } from 'react'
import { Captions, CaptionsOff, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { Candidate } from '../types'
import { audioSrc } from '../data'
import { audible, useAudible } from '../lib/audible'
import { formatTime } from '../lib/format'
import { cueAt, useCues } from '../lib/vtt'

const SPEEDS = [1, 1.5] as const

/**
 * Portrait video resume with custom controls (finding 03).
 * The "video" is the candidate's portrait with simulated playback over a real
 * spoken soundtrack; captions and the transcript come from the same .vtt cues.
 */
export function VideoResume({ c }: { c: Candidate }) {
  const key = `modal:${c.id}`
  const a = useRef<HTMLAudioElement>(null)
  const cues = useCues(c.id)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(c.duration)
  const [muted, setMuted] = useState(false)
  const [cc, setCc] = useState(true)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const soundOwner = useAudible() === key

  // If something else becomes audible, this player mutes itself
  useEffect(() => {
    if (!soundOwner && playing && !muted) setMuted(true)
  }, [soundOwner]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (a.current) a.current.muted = muted
    if (playing && !muted) audible.set(key)
  }, [muted, playing, key])

  useEffect(() => {
    if (a.current) a.current.playbackRate = speed
  }, [speed])

  // Detached media keeps playing, so stop it when the candidate changes or the modal closes
  useEffect(() => {
    const el = a.current
    return () => {
      el?.pause()
      if (audible.get() === key) audible.set(null)
    }
  }, [key])

  const toggle = () => {
    const el = a.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  const seek = (t: number, autoplay = false) => {
    const el = a.current
    if (!el) return
    el.currentTime = t
    setTime(t)
    if (autoplay && el.paused) el.play().catch(() => {})
  }

  const idx = cueAt(cues, time)
  const pct = dur ? (time / dur) * 100 : 0

  return (
    <div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#DCE3EC]">
        <img src={c.photo} alt={`${c.name}'s video resume`} data-playing={playing} className="kenburns size-full object-cover" />
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 grid place-items-center"
          aria-label={playing ? 'Pause video' : 'Play video'}
          tabIndex={-1}
        >
          {!playing && (
            <span className="grid size-16 place-items-center rounded-full bg-white/90 text-brand shadow-lg transition-transform hover:scale-105">
              <Play className="ml-1 size-7 fill-current" />
            </span>
          )}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        {cc && idx >= 0 && (
          <p className="pointer-events-none absolute inset-x-4 bottom-[76px] text-center" aria-live="off">
            <span className="box-decoration-clone rounded bg-black/75 px-2 py-0.5 text-[15px] font-medium leading-relaxed text-white">
              {cues[idx].text}
            </span>
          </p>
        )}

        {/* Custom controls */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <input
            type="range"
            className="seek w-full"
            min={0}
            max={dur || 0}
            step={0.1}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatTime(time)} of ${formatTime(dur)}`}
            style={{ ['--p' as string]: `${pct}%` }}
          />
          <div className="mt-1 flex items-center gap-1 text-white">
            <CtrlButton label={playing ? 'Pause' : 'Play'} onClick={toggle}>
              {playing ? <Pause className="size-[18px] fill-current" /> : <Play className="size-[18px] fill-current" />}
            </CtrlButton>
            <CtrlButton label={muted ? 'Unmute' : 'Mute'} pressed={!muted} onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
            </CtrlButton>
            <span className="ml-1 text-xs font-medium tabular-nums text-white/90">
              {formatTime(time)} / {formatTime(dur)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <CtrlButton label={cc ? 'Hide captions' : 'Show captions'} pressed={cc} onClick={() => setCc((v) => !v)}>
                {cc ? <Captions className="size-[18px]" /> : <CaptionsOff className="size-[18px]" />}
              </CtrlButton>
              <button
                type="button"
                onClick={() => setSpeed((s) => (s === 1 ? 1.5 : 1))}
                aria-label={`Playback speed ${speed}×, switch to ${speed === 1 ? 1.5 : 1}×`}
                className="h-8 min-w-11 rounded-md px-2 text-xs font-bold tabular-nums hover:bg-white/15"
              >
                {speed}×
              </button>
            </div>
          </div>
        </div>

        <audio
          ref={a}
          src={audioSrc(c.id)}
          preload="metadata"
          onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={() => audible.get() === key && audible.set(null)}
        />
      </div>

      {/* Transcript: same cues as the captions; click a line to seek */}
      <div className="mx-auto mt-5 max-w-[420px]">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Transcript</h3>
        {cues.length ? (
          <ol className="space-y-0.5">
            {cues.map((q, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => seek(q.start + 0.01, true)}
                  aria-current={i === idx ? 'true' : undefined}
                  className={`flex w-full gap-3 rounded-lg px-3 py-2 text-left text-[14px] leading-snug transition-colors ${
                    i === idx ? 'bg-brand-50 text-ink' : 'text-[#3B4456] hover:bg-[#F1F3F7]'
                  }`}
                >
                  <span className={`w-9 shrink-0 pt-px text-xs font-medium tabular-nums ${i === idx ? 'text-brand' : 'text-muted'}`}>
                    {formatTime(q.start)}
                  </span>
                  <span className={i === idx ? 'font-medium' : ''}>{q.text}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">Loading transcript…</p>
        )}
      </div>
    </div>
  )
}

function CtrlButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="grid size-8 place-items-center rounded-md hover:bg-white/15"
    >
      {children}
    </button>
  )
}
