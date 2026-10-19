# Changelog

## 1.4.1 — 2026-10-19

- Fix the English export metadata plural: a single row now reads `1 row listed` instead of `1 rows listed` (and a single match reads `1 match`).
- Ship the reworked README in the npm tarball — 1.4.0 was published before the compatibility, troubleshooting, development and badge sections landed.

## 1.4.0 — 2026-10-18

- **Copy / export Markdown**: header buttons copy the current result set, or save it as `.md`; the document has an H1, a metadata block (scope, options, timestamp, match count) and `### 第 N 轮` sections with `- **source** — snippet` rows.
- **Search options row**: regex (`.*`), case-sensitive (`Aa`), whole word (`ab`); invalid patterns are reported inline instead of failing silently. Options persist in localStorage.
- Regex mode wraps the pattern in lookbehind/lookahead for whole-word matching and skips zero-length matches so `*` style patterns cannot loop.

## 1.3.0

- **Turn derivation and grouping**: each row carries the turn it belongs to (count of `user` nodes up to that point), and the list is grouped under turn headers.
- **Query history**: last 12 queries, `↑`/`↓` in the input; last query is restored when the panel reopens.
- **Navigation**: `Ctrl+G` / `F3` (Shift to reverse), `↑`/`↓` row selection when the input is not focused.
- **Highlight all matches** in the conversation, not just the active one.
- **Prose mode payload toggle** no longer resets on every keystroke and gets its own wording; "excluded N" is now clickable and switches to full-content search.

## 1.2.0

- **Prose-only scope** (default): search your messages and assistant replies only, with a one-click switch to everything and an "excluded N matches" counter.

## 1.1.0

- **Wider panel** (up to 820px) and a 3-line snippet per row.
- **Source classification**: you / assistant / reasoning / tool call / tool result / system, with a filter bar and per-source counts.
- **Friendly rows**: source chip, turn chip, `同文 ×N`, hit count per row.

## 1.0.0

- `Ctrl+F` panel over the loaded conversation: results list, click to jump, CSS Custom Highlight API highlighting, same-text merging, collapsed-step expansion.
