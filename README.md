# RemoteRecruit · Option A prototype

Redesign of the **candidate card** and the **profile preview modal** as a coherent pair.
Take-home for the UX Designer II role (Part 2, Option A). This prototype shows the hierarchy and the
interactions working. It is not production code.

**Stack:** Vite, React, TypeScript, Tailwind v4, Framer Motion, lucide-react. Mock data lives in local JSON, with no backend. Light mode only.

## What changed, mapped to the audit findings

| Finding | UI change | Where |
|---|---|---|
| **04 · Profile hides decision info** (top priority) | The modal opens on a **decision header**: role, rate, experience, AI match, languages, availability, top skills and a primary **Message** button, all above the fold at 1440×900. The name is moderate in size and no longer the hero. A **sticky footer** (name · rate · Message) appears once the header scrolls away. On the card, **rate is the most prominent number**, followed by the top 3 skills and an AI match meter. Info sits *below* the media, not over the photo. | `ProfileModal.tsx`, `CandidateCard.tsx` |
| **01 · Clicking a Top Candidate loses the person** | **Top candidates** shows the 4 highest AI matches on a brand-blue shader background. Clicking any card, in that row or the grid, opens **that candidate's** preview. The URL deep-links (`?c=<id>`), the browser back button closes the modal, and a shared link opens straight to the candidate. Prev/next (and ← →) let employers compare without closing. "3 of 12 · UX Designer" keeps the search context. Esc closes and focus returns to the card. | `App.tsx`, `ProfileModal.tsx` |
| **02 · Video previews are muted, with no way to hear them** | Hovering a card plays a muted preview with live captions. A **speaker toggle** unmutes it. **Only one source is audible at a time**: unmuting another card, or playing the modal video, silences the previous one. | `CandidateCard.tsx`, `lib/audible.ts` |
| **03 · No captions, blurred AI score, "--" values** | A **CC toggle** (captions on by default), driven by a `.vtt` file per candidate, plus 1× / 1.5× speed. Muted card previews also show live captions. (The transcript list was cut after review to keep the video column lean.) The **AI match** shows its number, with an ⓘ popover explaining that it's "Based on skills match, experience and video assessment". Missing values read **"Rate on request"** or **"Not provided"**, never `--` or `$-/hr`. Cards show a **CC badge** when captions exist. | `VideoResume.tsx`, `ProfileSections.tsx`, `lib/format.ts` |
| **Request · No tabs** | Video and details sit side by side. **Portfolio** and **Code activity** follow in the same scroll. Blocks the candidate hasn't filled are hidden (e.g. Lucas has no GitHub). | `ProfileSections.tsx` |
| **Keep hiring on-platform** | No external links (GitHub, Behance, Dribbble, LinkedIn), so employers can't reach the candidate outside RR. Portfolio projects open in an **in-platform case-study viewer**. Developer work appears as **Code activity, "Verified via GitHub"**: repo count, active weeks, top languages and a contribution strip, imported once via OAuth with no handle or link shown. | `ProfileSections.tsx` |
| **Decision header balance** | The four key-fact tiles have icons, so the right column matches the height of the identity + top skills column. | `ProfileModal.tsx` |

## Empty states to demo
- **Priya Raman:** no hourly or annual rate → "Rate on request" / "Not provided".
- **Lucas Ferreira, Jack Thompson, Dimas Pratama, Marco De Luca, Grace Mensah:** no GitHub, so Code activity is hidden.
- **Jack Thompson, Marco De Luca:** annual rate "Not provided".

## Media
All candidates are fictional. Portraits are free-license photos from Unsplash, served through Unsplash's image CDN with a face-centred crop. Each "video resume" is the portrait with
simulated playback over a **real spoken soundtrack** generated with macOS text-to-speech, using varied
English accents. `npm run media` regenerates `public/media/<id>.m4a`, the matching `<id>.vtt` captions and
`src/data/media.json` (durations) from the transcript lines in `src/data/candidates.json`.

## Run
```bash
npm install
npm run dev
```

## Deploy
GitHub repo `remote-recruit` → Cloudflare Pages. Build command `npm run build`, output directory `dist`.
