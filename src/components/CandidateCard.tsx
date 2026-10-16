import { useEffect, useRef, useState } from 'react'
import { Bookmark, BookmarkCheck, Volume2, VolumeX } from 'lucide-react'
import type { Candidate } from '../types'
import { audioSrc } from '../data'
import { audible, useAudible } from '../lib/audible'
import { formatTime, rankedSkills } from '../lib/format'
import { loadCues, cueAt, type Cue } from '../lib/vtt'
import { AvailabilityDot, Equalizer, MatchMeter, SkillChip } from './ui'

interface Props {
  c: Candidate
  isMatch: (skill: string) => boolean
  saved: boolean
  onToggleSave: () => void
  onOpen: (el: HTMLElement) => void
  variant?: 'grid' | 'carousel'
}

export function CandidateCard({ c, isMatch, saved, onToggleSave, onOpen, variant = 'grid' }: Props) {
  const key = `card:${variant}:${c.id}`
  const audioRef = useRef<HTMLAudioElement>(null)
  const hovered = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [cues, setCues] = useState<Cue[]>([])
  const soundOn = useAudible() === key

  // Another source took the sound: go back to muted (and stop if not hovered)
  useEffect(() => {
    const a = audioRef.current
    if (!a || soundOn) return
    a.muted = true
    if (!hovered.current) stop()
  }, [soundOn])

  useEffect(() => {
    const el = audioRef.current
    return () => {
      el?.pause()
      if (audible.get() === key) audible.set(null)
    }
  }, [key])

  function stop() {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.currentTime = 0
    setTime(0)
  }

  function play(muted: boolean) {
    const a = audioRef.current
    if (!a) return
    a.muted = muted
    loadCues(c.id).then(setCues)
    a.play().catch(() => {})
  }

  const onEnter = () => {
    hovered.current = true
    if (!soundOn) play(true)
  }
  const onLeave = () => {
    hovered.current = false
    if (!soundOn) stop()
  }
  const toggleSound = () => {
    if (soundOn) {
      audible.set(null)
    } else {
      audible.set(key)
      play(false)
    }
  }

  const skills = rankedSkills(c, isMatch)
  const extra = skills.length - 3
  const cueIdx = cueAt(cues, time)
  const caption = playing && !soundOn && cueIdx >= 0 ? cues[cueIdx].text : null

  return (
    <article
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_8px_28px_-12px_rgba(15,23,42,.25)] focus-within:shadow-[0_8px_28px_-12px_rgba(15,23,42,.25)] ${
        variant === 'carousel' ? 'w-[248px] shrink-0 snap-start sm:w-[264px]' : ''
      }`}
    >
      {/* Media: 4:5 portrait "video" */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#DCE3EC]">
        <img
          src={c.photo}
          alt=""
          loading="lazy"
          data-playing={playing}
          className="kenburns size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {formatTime(playing ? c.duration - time : c.duration)}
          </span>
          {c.hasCaptions && (
            <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm" title="Captions available">
              CC
            </span>
          )}
        </div>

        {caption && (
          <p className="pointer-events-none absolute inset-x-3 bottom-12 line-clamp-2 rounded-md bg-black/70 px-2 py-1 text-center text-[12px] leading-snug text-white">
            {caption}
          </p>
        )}

        {/* Sound toggle (02): sits above the card's click target */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? `Mute ${c.name}'s video` : `Play ${c.name}'s video with sound`}
          className={`absolute bottom-3 right-3 z-10 flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold backdrop-blur-sm transition-colors ${
            soundOn ? 'bg-white text-brand' : 'bg-black/55 text-white hover:bg-black/70'
          }`}
        >
          {soundOn ? <Equalizer /> : null}
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          <span aria-hidden className={soundOn ? '' : 'hidden group-hover:inline'}>{soundOn ? 'Sound on' : 'Unmute'}</span>
        </button>

        {playing && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
            <div className="h-full bg-white" style={{ width: `${(time / (c.duration || 1)) * 100}%` }} />
          </div>
        )}

        <audio
          ref={audioRef}
          src={audioSrc(c.id)}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={(e) => {
            e.currentTarget.currentTime = 0
            if (soundOn) audible.set(null)
            else if (hovered.current) e.currentTarget.play().catch(() => {})
          }}
        />
      </div>

      {/* Bookmark */}
      <button
        type="button"
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${c.name} from saved` : `Save ${c.name}`}
        className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full backdrop-blur-sm transition-colors ${
          saved ? 'bg-brand text-white' : 'bg-white/85 text-ink hover:bg-white'
        }`}
      >
        {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      </button>

      {/* Body: info sits below the media, not on the photo */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold">
              {/* Stretched button: the whole card opens this candidate (01) */}
              <button
                type="button"
                data-card={`${variant}:${c.id}`}
                onClick={(e) => onOpen(e.currentTarget)}
                className="text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-brand"
              >
                {c.name}
              </button>
            </h3>
            <span className="text-sm" title={c.country} aria-label={c.country}>{c.flag}</span>
            <AvailabilityDot value={c.availability} />
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {c.role} · {c.years} yrs
          </p>
        </div>

        <p className={c.rate == null ? 'text-[15px] font-semibold text-muted' : 'text-[22px] font-bold leading-none tracking-tight'}>
          {c.rate == null ? (
            'Rate on request'
          ) : (
            <>
              ${c.rate}
              <span className="text-sm font-medium text-muted">/hr</span>
            </>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((s) => (
            <SkillChip key={s} match={isMatch(s)}>{s}</SkillChip>
          ))}
          {extra > 0 && <SkillChip>+{extra}</SkillChip>}
        </div>

        <MatchMeter value={c.aiMatch} className="mt-auto pt-1" />
      </div>
    </article>
  )
}
