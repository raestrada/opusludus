# Opus Ludus — Agent Instructions

## Project Overview

Opus Ludus is an interactive, gamified web platform for learning classical music composition. It follows a conservatory-ordered curriculum spanning 7 levels and 39 modules — from reading notes on a staff to advanced techniques like serialism, polytonality, and free composition.

The experience is structured as a game: users learn theory, complete composition challenges on a real music staff, earn XP and stars, unlock badges, and climb ranks from Novice to Virtuoso.

**Target audience:** young musicians in conservatories and music academies.

## Language Policy

- **Code, comments, documentation, commit messages, and AGENTS.md:** English only.
- **User-facing site UI:** bilingual — Spanish (es) and English (en). All user-visible strings live in i18n JSON files (`src/en/en.json`, `src/es/es.json`) and in bilingual data structures in `src/_data/curriculum.js` and `src/_data/gamification.js`.
- **Default locale:** Spanish (`es`), set in `src/_data/site.json`.

## Tech Stack

| Concern | Technology |
|---|---|
| Static site generator | Eleventy (3.x) |
| JavaScript bundler | Webpack 5 + Babel |
| Music notation rendering | VexFlow 5 |
| Audio synthesis | Tone.js 15 |
| Templating | Nunjucks (`.njk`) |
| Package manager | npm |

## Project Structure

```
opusludus/
├── src/                          # Source files (Eleventy input)
│   ├── index.html                # Root redirect (browser language detection → /es/ or /en/)
│   ├── _data/                    # Global data files
│   │   ├── site.json             # Site metadata, locales config
│   │   ├── curriculum.js         # 7 levels, 39 modules with challenges
│   │   └── gamification.js       # Ranks, badges, star thresholds, XP formula
│   ├── _includes/layouts/       # Nunjucks layout templates
│   │   ├── base.njk              # Base HTML shell with header/footer/nav
│   │   ├── home.njk              # Home page layout
│   │   ├── modules.njk           # Curriculum/modules listing layout
│   │   └── play.njk              # Game workspace layout (notation editor)
│   ├── en/                       # English locale
│   │   ├── en.json               # English UI strings
│   │   ├── index.njk             # English home page
│   │   ├── modules.njk           # English modules page
│   │   └── play.njk              # English play page
│   ├── es/                       # Spanish locale
│   │   ├── es.json               # Spanish UI strings
│   │   ├── index.njk             # Spanish home page
│   │   ├── modules.njk           # Spanish modules page
│   │   └── play.njk              # Spanish play page
│   └── assets/
│       ├── css/main.css          # Stylesheet (passthrough copy to public/)
│       └── js/                   # Client-side JavaScript
│           ├── index.js          # Entry point — game bootstrap, UI wiring, HUD
│           ├── engine/           # Core engines
│           │   ├── audio.js      # Audio engine (Tone.js wrapper)
│           │   ├── evaluator.js  # Challenge validation / scoring
│           │   ├── midi.js       # MIDI utilities
│           │   ├── notation.js   # VexFlow notation renderer
│           │   └── theory.js     # Music theory helpers
│           ├── game/             # Game logic
│           │   └── GameManager.js # Composition state, note CRUD, orchestration
│           └── store/            # Client-side state management
│               ├── i18n.js       # Locale helpers
│               ├── lessons.js    # Lesson example definitions
│               └── progress.js   # XP, streaks, localStorage persistence
├── public/                       # Eleventy output (static site)
├── .eleventy.js                  # Eleventy configuration
├── .eleventyignore               # Eleventy ignore patterns
├── webpack.config.js             # Webpack configuration
├── package.json
└── AGENTS.md                     # This file
```

## Development Commands

```bash
npm run dev            # Start Eleventy dev server + Webpack watch (parallel)
npm run build          # Production build (Webpack → Eleventy)
npm run dev:eleventy   # Eleventy only (port 8080)
npm run dev:webpack    # Webpack watch only
npm run clean          # Remove public/ and dist/
```

## Architecture Notes

### Build Pipeline

1. **Webpack** bundles `src/assets/js/index.js` → `src/assets/js/bundle.js` (with source maps).
2. **Eleventy** builds the static site from `src/` → `public/`, copying CSS and the webpack bundle via passthrough.

### i18n Pattern

- Eleventy passes `locale` (from directory path: `en` or `es`) to all templates.
- A custom `t` Nunjucks filter resolves bilingual objects: `{{ obj | t(locale) }}` picks the right language.
- A custom `tList` filter does the same for arrays of bilingual objects.
- On the client side, `locale` is injected via `window.__OPUS_LUDUS__` from the play page template.

### Game Flow

1. User selects a module → navigates to `/{locale}/play/?module=<id>`.
2. **Step 1 (Lesson):** Theory explanation with an example staff rendered by VexFlow and playable audio via Tone.js.
3. **Step 2 (Challenge):** Composition workspace with:
   - Interactive staff (VexFlow SVG) — click to select measures, add notes via palette or piano keyboard.
   - Duration palette, note palette, measure navigation.
   - Transport controls (play/stop via Tone.js).
   - Evaluate (check rules without submitting) and Submit (save progress, award XP/stars).
4. **Result modal:** Shows stars, score %, XP earned, streak, next module unlock.

### Validation Engine

Each module's `challenge.validations` array defines rules checked by the evaluator. Validation types include: `noteInStaff`, `measureHasNotes`, `measureFillsTimeSignature`, `isChordProgression`, `voiceLeading`, `isTernaryForm`, etc.

### Gamification

- **Ranks:** Novice (0 XP) → Apprentice (500) → Composer (1500) → Maestro (3500) → Virtuoso (7000+).
- **Stars:** 1 star at 50% validation pass, 2 at 75%, 3 at 95%.
- **Streak bonus:** +10% XP per consecutive day, max +50%.
- **Badges:** Awarded for milestones (first composition, perfect scores, completing levels, 7-day streak, etc.).

## Code Conventions

- Use ES modules (`import`/`export`) throughout client-side JS.
- Follow existing patterns in each file — do not introduce new libraries without verifying they're already in `package.json`.
- All new code, variable names, function names, and comments must be in English.
- User-facing strings go in the appropriate i18n JSON file or in the bilingual data structures (not hardcoded).
- CSS is plain CSS in `src/assets/css/main.css`. No preprocessors.
- Templates use Nunjucks (`.njk`) with the base layout inheritance pattern.

## Adding New Modules

1. Add an entry to the `curriculum` array in `src/_data/curriculum.js` with full bilingual `name`, `description`, `tips`, and `challenge` definition.
2. If the module has a lesson example, add it to `src/assets/js/store/lessons.js`.
3. Add any new validation types to `src/assets/js/engine/evaluator.js`.

## Adding New Locale Strings

1. Add the string to both `src/en/en.json` and `src/es/es.json`.
2. Reference it in templates or inject it via global data for client-side use.
3. For module-specific content, ensure all fields in `curriculum.js` have both `en` and `es` keys.
