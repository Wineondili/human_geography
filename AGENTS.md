# AGENTS

- Git workflow: work in small batches and commit frequently.
- Do not push unless explicitly authorized.
- Before high-risk destructive commands, explain intent before execution.
- After each committed change batch, append a timestamp log entry in this file.

## Log
- 2026-03-05 15:18:42 +0800: Repository bootstrap created (`README.md`, `AGENTS.md`, `.gitignore`) on branch `main`.
- 2026-03-05 15:25:26 +0800: Bootstrapped Vite+React app scaffold, added TypeScript config, scripts, and imported chapter 1 vocab JSON to public/data.
- 2026-03-05 15:32:17 +0800: Implemented flashcard study flow, direction switch, keyboard controls, and localStorage-backed progress persistence.
- 2026-03-05 15:26:18 +0800: Implemented flashcard study flow, direction switching, keyboard controls, and localStorage-backed progress persistence.
- 2026-03-05 15:27:32 +0800: Added quiz mode (4-option mode-switch questions), quiz scoring, and expanded study statistics UI; added dedicated quiz vocab helpers and styling.
- 2026-03-05 15:27:46 +0800: Added README docs, updated npm lint to type-check (tsc --noEmit), and verified build/lint pass.
- 2026-03-05 16:04:33 +0800: Introduced motion infrastructure with framer-motion, modularized UI shell components, and split visual styles into tokens/layout/motion layers.
- 2026-03-05 16:06:35 +0800: Upgraded flashcard stage with 3D flip reveal, horizontal card transitions, pointer tilt, tactile button feedback, and animated streak tile updates.
- 2026-03-05 16:08:18 +0800: Animated quiz flow with staged prompt/options transitions, feedback icon rhythm, and tweened accuracy counter updates.
- 2026-03-05 16:09:13 +0800: Added motion-reduced guards, will-change performance hints, and refreshed README with visual theme, shortcuts, and accessibility notes.
- 2026-03-06 11:14:33 +0800: Added a start gate for manual mode selection and rewrote quiz mode as shuffled typed-answer drills with enter-to-submit retry loops.
- 2026-03-06 11:27:51 +0800: Split quiz direction switching into two compact buttons for direct EN-CN and CN-EN selection.
- 2026-03-06 11:37:33 +0800: Moved quiz direction choice to the entry screen and made typed-answer validation ignore case, whitespace, and punctuation while treating blank submit as wrong.
- 2026-03-06 11:39:00 +0800: Strengthened quiz input autofocus and added Ctrl+/ (Cmd+/ on macOS) to quickly refocus the answer field.
- 2026-03-06 11:44:23 +0800: Removed non-study UI copy from the quiz flow, tightened the quiz header/controls, and reordered mobile quiz layout so the answer field stays higher and easier to reach.
- 2026-03-06 14:16:00 +0800: Simplified study mode into manual card flipping, added ordered/shuffle queue resets for flashcards, and removed the sliding card highlight overlay.
- 2026-03-06 14:17:17 +0800: Hid the 8-tile stats ribbon in study mode so only the flashcard controls remain visible while keeping quiz statistics unchanged.
- 2026-03-06 14:18:21 +0800: Removed on-screen shortcut hints from study mode controls while preserving the underlying keyboard shortcuts.
- 2026-03-06 14:20:27 +0800: Normalized Chinese vocab displays and quiz answers to strip trailing English aliases such as `未知之地（Terra Incognita）`.
- 2026-03-06 14:24:32 +0800: Added an overview mode entry with a vertically scrollable multi-column chapter vocab list that keeps at least two columns on mobile.
