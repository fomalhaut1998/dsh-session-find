# Design notes

The plugin is one hand-written client module (`client.js`, no build step) plus an empty host half. These notes record the non-obvious decisions behind it.

## Where the data comes from

```
ctx.sessions / conversation store
  order: [key, key, ...]        // canonical display order
  nodeStore.get(key)            // node: { kind, blocks?, parts?, text? }
```

Search walks `order` and reads each node, **not** the DOM. DOM-based find (what the browser does) only sees rendered text: collapsed steps, reasoning details and tool payloads are not in the DOM, so they are unreachable. Store-based search sees everything the session has loaded.

Legacy sessions that predate `order` fall back to `legacy.nodes`.

## Projection: turning a node into searchable text

`collectParts(node)` flattens a node into `{ text, role }` fragments. Roles come from three layers:

| Layer | Example keys | Role |
|---|---|---|
| node kind | `user`, `steering` | your message |
| node kind | `assistant-step` | assistant |
| node kind | `system-prompt`, `compaction`, `turn-error`, … | system |
| block kind | `reasoning` / `tool-call` / `tool-result` / `text` | that block's role |
| raw key | `args`, `toolCall`, `toolResult`, … | tool call / result |

Two projections are built from the same fragments:

- **full**: every fragment, prefixed with a human-readable projection of card-shaped payloads (so a JSON blob is also searchable as prose).
- **prose**: only `user` and `assistant` text.

Prose mode runs the search twice: once over the full projection (for the true total) and once over prose (for the rows). `excluded = total − proseHits`.

## Matching

`buildMatcher(query, options)` returns either a literal or a regex matcher:

- Literal: optional lower-casing on both sides (case-insensitive default), optional word-boundary check that is applied **only** when the query is pure ASCII word characters — Chinese has no word boundaries, so a whole-word switch would silently return nothing otherwise.
- Regex: the user's pattern, wrapped in `(?<![A-Za-z0-9_])` / `(?![A-Za-z0-9_])` when whole-word is on, with `g` + optional `i`. Compilation errors surface inline; zero-length matches advance `lastIndex` so `*` or `^` cannot loop forever.

Each hit records `at` (offset), `len` (matched length) and `match` (the matched substring). Downstream code uses `len`/`match` instead of assuming the match length equals the query length — they differ for regex.

## Merging identical snippets

`dedupeHits` buckets hits by normalized snippet text and keeps the first (highest in the conversation) one, recording the count. The bucket also stores the **first** turn it appeared in so that the merged row cannot jump backwards and break turn grouping (this was a real bug: a merged row inherited a later turn and the list rendered `第 1 / 第 2 / 第 4 / 第 1 轮`).

## Jumping

1. Expand the target turn / steps if collapsed.
2. Binary-search turn anchors in the scroller, then move `scrollTop` in one direction until the node key is mounted.
3. Fall back to matching the node's text content when the key is not found (virtualized lists sometimes remount with different keys).
4. Report `jumpApproximate` when the hit lives inside a collapsed step: the container is located, the text is not visible.

## Highlighting

CSS Custom Highlight API:

- `::highlight(dsh-session-find)` — the active hit.
- `::highlight(dsh-session-find-all)` — every mounted hit (capped at 240 ranges per pass to keep the pass cheap).

No DOM mutation, so React reconciliation is untouched. Highlights are recomputed when results change and repainted after a jump.

## Panel behaviour worth keeping

- Result rows are registered with `data-row="true"`; all keyboard navigation (`↑`/`↓`, `Enter`, `Ctrl+G`) walks **only listed rows**, never the filtered-out ones. Earlier versions jumped to hidden rows after filtering.
- The query box keeps history (12 entries) and last query in `localStorage`; `↑`/`↓` recalls history only when there is no selection and the caret is at an edge.
- Scope / options / payload toggles persist; changing the query does not reset them.
- Export is a `Blob` + `<a download>`; in the Electron desktop shell this opens the native save dialog in a short-lived window. `File System Access API` was tried and dropped: the first call worked, later calls silently degraded to a regular Chromium download.

## Not done on purpose

- **No host half**: no index, no IPC, no cross-session search. It would need a background indexer and does not fit "zero dependencies".
- **No fuzzy matching**: substring + regex only. Fuzzy over tool JSON gives noise, not help.
