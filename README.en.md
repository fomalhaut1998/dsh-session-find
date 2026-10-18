# dsh-session-find

**Find in session** for DeepSeek Harness: press `Ctrl+F` to search the current conversation, click a hit to jump to that message, with every match highlighted.

Client-only, zero dependencies, no network — all searching happens in the browser, nothing leaves your machine.

[中文](README.md) · [Changelog](CHANGELOG.md)

![Find panel](assets/overview.png)

## Why

Harness conversations run for dozens of turns and interleave prose with tool calls and long JSON. The browser's built-in find only sees *rendered, visible* text: it misses collapsed steps, tool arguments and reasoning, and it cannot tell you who said what, or in which turn.

This plugin makes search conversation-native:

| Capability | What it does |
|---|---|
| Source labels | Every hit is tagged **you / assistant / reasoning / tool call / tool result / system**, and can be filtered by source |
| Turn grouping | Results are grouped under 「第 N 轮」 (turn N) headers, with a per-row turn chip |
| Same-text merging | Identical snippets (e.g. repeated tool output) collapse into one row marked `同文 ×N` |
| Prose vs everything | Defaults to **prose only** (your messages + assistant replies); one click searches reasoning, tool payloads and system prompts too, showing how many hits were excluded |
| Regex / case / whole word | For tokens like `m0\d{3}`, `session-`, `D:\\DSH`; whole-word applies to ASCII words only |
| Highlight everything | All matches are highlighted in the conversation; the active hit gets an outline |
| Copy / export | Copy results as Markdown (turn + source + snippet) or save a `.md` file |
| Persisted state | Query, scope, regex flags and the last 12 queries live in localStorage (`↑`/`↓` in the input recalls history) |

## Install

```sh
# npm (`--profile` defaults to the current profile)
dsh plugin add dsh-session-find
dsh plugin --profile desktop add dsh-session-find

# or track main
dsh plugin add github:fomalhaut1998/dsh-session-find
```

Fully quit and restart DSH once: client bundles are assembled at host startup and are not hot-loaded. After that, editing `client.js` only needs a page reload.

Remove: `dsh plugin remove dsh-session-find` (also accepts `--profile`).

## Shortcuts

| Key | Action |
|---|---|
| `Ctrl+F` | Open / close the panel |
| `Enter` / `Shift+Enter` | Next / previous hit |
| `Ctrl+G` / `F3` (with `Shift` to reverse) | Same, for editor habits |
| `↑` / `↓` | In the input: recall query history. In the list (input not focused): move the selection |
| `Esc` | Close the panel (highlights stay until the next search) |

## How it works

- Reads the conversation store's canonical `order` node by node (`nodeStore.get(key)`) instead of walking the DOM, so collapsed steps and unrendered tool payloads are searchable.
- Projects each node into source-tagged fragments; prose mode concatenates only `user` + `assistant` text, and "excluded N" is the difference to the full hit count.
- Jumping expands the target turn/step first, then converges with a turn-level binary search plus a single-direction `scrollTop`, falling back to content matching when keys disagree.
- Highlighting uses the CSS Custom Highlight API, so the DOM is never mutated and React rendering is untouched.
- `index.js` `apply()` is empty: no IPC, no background index, no requests.

## Limitations

| Limit | Why |
|---|---|
| Only **loaded** history | The session is paged in on demand; unloaded messages are not in the store |
| Result list capped at 300 rows | A scrolling panel beyond that is not usable; the match count itself is uncapped |
| Whole-word is ASCII-only | Chinese has no word boundaries, so the option only applies to pure ASCII queries |
| No cross-session search | That needs a host-side index; out of scope for v1 |

## License

MIT
