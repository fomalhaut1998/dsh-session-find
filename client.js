// dsh-session-find - Ctrl+F full-text find inside the current conversation.
// Hand-written in the Client module-loader format. No Harness Client package is imported;
// styling uses --dsw-alias-* theme tokens only, with literal fallbacks.
window.__ModuleLoader__.load({
  id: 'dsh-session-find',
  factory(require) {
    var React = require('react');
    var h = React.createElement;
    var NS = 'dsh-session-find';
    var MAX_RESULTS = 300;
    var SEARCH_DEBOUNCE_MS = 140;
    var LF = String.fromCharCode(10);
    var QUOTE = String.fromCharCode(34);
    var BACKSLASH = String.fromCharCode(92);

    var ZH = {
      open: '查找',
      placeholder: '在对话中查找…',
      hint: 'Enter 下一个 · Shift+Enter 上一个 · ↑↓ 历史 · Esc 关闭',
      count: '{n} 处匹配',
      limited: '（仅列前 {n} 条）',
      none: '没有匹配',
      empty: '输入关键词开始查找',
      prev: '上一个',
      next: '下一个',
      close: '关闭',
      jumpFailed: '没能定位到该条',
      jumpApproximate: '已跳到所在回合（该条在折叠步骤里）',
      jumpHidden: '已定位到该条 · 命中文字在思考/工具详情里，当前视图只显示摘要',
      sameText: '同文 ×{n}',
      payloadMore: '另有 {n} 条在源码/工具内容里 · 显示',
      payloadHide: '隐藏 {n} 条源码/工具内容命中',
      payloadOnly: ' · 命中都在源码/工具内容里',
      merged: ' · 已合并 {n} 条同文',
      turn: '第 {n} 轮',
      hits: '命中 {n} 处',
      filterAll: '全部',
      scopeProse: '只在正文里搜',
      scopeAll: '搜全部内容',
      scopeHint: '不含思考 / 工具 / 系统',
      scopeExcluded: '已排除 {n} 处',
      scopeMiss: '正文无匹配，另有 {n} 处',
      scopeSwitchAll: '切到搜全部内容',
      groupTurn: '第 {n} 轮',
      payloadMoreProse: '另有 {n} 条在源码形态里 · 显示',
      payloadHideProse: '隐藏 {n} 条源码形态命中',
      payloadOnlyProse: ' · 命中都在源码形态里',
      roleUser: '你',
      roleAssistant: '助手',
      roleReasoning: '思考',
      roleToolCall: '工具调用',
      roleToolResult: '工具输出',
      roleSystem: '系统',
      roleOther: '其它',
      optRegex: '正则',
      optRegexHint: '按正则表达式匹配，例如 m0.4、^第、\\d+' ,
      optMatchCase: '区分大小写',
      optMatchCaseHint: 'Aa：大小写敏感',
      optWholeWord: '全词',
      optWholeWordHint: 'ab：只匹配完整的英文/数字词',
      optHint: '.* 正则 · Aa 区分大小写 · ab 全词',
      regexInvalid: '正则表达式无效',
      regexHintBad: '检查括号与转义',
      exportCopy: '复制结果为 Markdown',
      exportDownload: '导出 Markdown 文件',
      exportPrompt: '已生成 Markdown，请在保存对话框中确认',
      exportTitle: '检索：{q}',
      exportMeta: '{n} 处匹配 · 列出 {rows} 条',
      exportCopied: '已复制 Markdown 到剪贴板',
      exportFailed: '复制/导出失败，请重试',
      user: '你',
      assistant: 'AI',
      tool: '工具',
      other: '其它'
    };
    var EN = {
      open: 'Find',
      placeholder: 'Find in conversation…',
      hint: 'Enter next · Shift+Enter previous · ↑↓ history · Esc close',
      count: '{n} matches',
      limited: '(first {n} only)',
      none: 'No matches',
      empty: 'Type to search this conversation',
      prev: 'Previous',
      next: 'Next',
      close: 'Close',
      jumpFailed: 'Could not locate that message',
      jumpApproximate: 'Landed on the turn (the message sits in a collapsed step)',
      jumpHidden: 'Landed · the match lives in reasoning/tool details, which this view summarises',
      sameText: 'same text ×{n}',
      payloadMore: '{n} more in source/tool payloads · show',
      payloadHide: 'hide {n} source/tool hits',
      payloadOnly: ' · all hits are in source/tool payloads',
      merged: ' · merged {n} duplicates',
      turn: 'Turn {n}',
      hits: '{n} hits',
      filterAll: 'All',
      scopeProse: 'Message text only',
      scopeAll: 'Search everything',
      scopeHint: 'skips reasoning, tools, system',
      scopeExcluded: '{n} elsewhere',
      scopeMiss: 'no message hits; {n} elsewhere',
      scopeSwitchAll: 'search everything',
      groupTurn: 'Turn {n}',
      payloadMoreProse: '{n} more in source form · show',
      payloadHideProse: 'hide {n} source-form hits',
      payloadOnlyProse: ' · all hits are in source form',
      roleUser: 'You',
      roleAssistant: 'Assistant',
      roleReasoning: 'Reasoning',
      roleToolCall: 'Tool call',
      roleToolResult: 'Tool output',
      roleSystem: 'System',
      roleOther: 'Other',
      optRegex: 'Regex',
      optRegexHint: 'Match as a regular expression, e.g. m0.4',
      optMatchCase: 'Match case',
      optMatchCaseHint: 'Aa: case-sensitive match',
      optWholeWord: 'Whole word',
      optWholeWordHint: 'ab: whole ASCII words only',
      optHint: '.* regex · Aa case · ab whole word',
      regexInvalid: 'Invalid regular expression',
      regexHintBad: 'check brackets and escapes',
      exportCopy: 'Copy results as Markdown',
      exportDownload: 'Download Markdown',
      exportPrompt: 'Markdown ready — confirm it in the save dialog',
      exportTitle: 'Search: {q}',
      exportMeta: '{n} matches · {rows} rows listed',
      exportCopied: 'Markdown copied',
      exportFailed: 'Copy/download failed, please retry',
      user: 'You',
      assistant: 'Assistant',
      tool: 'Tool',
      other: 'Other'
    };

    /** Object keys whose values are identifiers or enums, not readable content. */
    var SKIP_KEYS = { key: 1, id: 1, messageId: 1, rpcId: 1, seq: 1, time: 1, kind: 1, type: 1, status: 1, role: 1, provider: 1, model: 1, requestId: 1, sessionId: 1, createdAt: 1, toolCallId: 1, callId: 1, source: 1, turn: 1, index: 1, form: 1, placement: 1 };
    var textCache = new WeakMap();
    var partsCache = new WeakMap();
    var roleHitCache = new WeakMap();
    /** Length of the readable prefix of each node text, so a hit can be flagged as
     *  "the form the page actually renders" rather than the JSON/markdown source. */
    var projectionCache = new WeakMap();
    /** Message text only: the visible prose, without reasoning, tool payloads or system nodes. */
    var proseCache = new WeakMap();

    /** Where a hit came from: the user, the assistant's prose, the model's hidden
     *  reasoning, a tool call (arguments) or a tool result (output), or system plumbing. */
    var ROLE_BY_BLOCK = { reasoning: 'reasoning', 'tool-call': 'toolCall', 'tool-result': 'toolResult', text: 'assistant' };
    var ROLE_BY_KEY = { reasoning: 'reasoning', toolCalls: 'toolCall', toolCall: 'toolCall', toolResults: 'toolResult', toolResult: 'toolResult', args: 'toolCall', arguments: 'toolCall' };
    var ROLE_BY_KIND = {
      user: 'user', steering: 'user', assistant: 'assistant', 'assistant-step': 'assistant',
      'system-prompt': 'system', context: 'system', 'turn-trigger': 'system', command: 'system',
      compaction: 'system', 'manual-compaction': 'system', 'model-retry': 'system',
      'turn-error': 'system', 'turn-max-tokens': 'system', 'turn-process': 'other',
      'turn-tail': 'other', unknown: 'other'
    };

    function roleOfKind(kind) {
      var name = String(kind === undefined || kind === null ? '' : kind);
      if (ROLE_BY_KIND[name] !== undefined) return ROLE_BY_KIND[name];
      if (name.indexOf('tool') >= 0) return name.indexOf('result') >= 0 ? 'toolResult' : 'toolCall';
      return 'other';
    }

    function projectionLengthOf(node) {
      var cached = projectionCache.get(node);
      return cached === undefined ? 0 : cached;
    }

    function isSpace(code) {
      return code === 32 || code === 9 || code === 10 || code === 13;
    }

    function collapse(value) {
      var out = '';
      var pending = false;
      for (var i = 0; i < value.length; i += 1) {
        var ch = value.charAt(i);
        if (isSpace(value.charCodeAt(i))) { pending = true; continue; }
        if (pending && out.length > 0) out += ' ';
        pending = false;
        out += ch;
      }
      return out;
    }

    function escapeAttribute(value) {
      var text = String(value);
      var out = '';
      for (var i = 0; i < text.length; i += 1) {
        var ch = text.charAt(i);
        if (ch === QUOTE || text.charCodeAt(i) === 92) out += BACKSLASH;
        out += ch;
      }
      return out;
    }

    /** Strings of a node, each tagged with the role of the block it belongs to. The
     *  order is unchanged from the original walk, so `textOf` still sees the same text. */
    function collectParts(value, out, depth, role) {
      if (depth > 7 || out.length > 600) return;
      if (typeof value === 'string') {
        var text = value.trim();
        if (text.length >= 2) out.push({ text: text, role: role });
        return;
      }
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length && out.length <= 600; i += 1) collectParts(value[i], out, depth + 1, role);
        return;
      }
      if (value !== null && typeof value === 'object') {
        var next = role;
        var blockKind = value.kind;
        if (typeof blockKind === 'string' && ROLE_BY_BLOCK[blockKind] !== undefined) next = ROLE_BY_BLOCK[blockKind];
        var keys = Object.keys(value);
        for (var k = 0; k < keys.length && out.length <= 600; k += 1) {
          var key = keys[k];
          if (SKIP_KEYS[key] === 1) continue;
          var keyRole = ROLE_BY_KEY[key];
          collectParts(value[key], out, depth + 1, keyRole !== undefined && next === 'assistant' ? keyRole : next);
        }
      }
    }

    function nodeParts(node) {
      if (node === null || typeof node !== 'object') return [];
      var cached = partsCache.get(node);
      if (cached !== undefined) return cached;
      var parts = [];
      collectParts(node, parts, 0, roleOfKind(node.kind));
      partsCache.set(node, parts);
      return parts;
    }

    /** Only the blocks the transcript renders as a message: user text and assistant prose. */
    function proseTextOf(node) {
      if (node === null || typeof node !== 'object') return '';
      var cached = proseCache.get(node);
      if (cached !== undefined) return cached;
      var parts = nodeParts(node);
      var flat = [];
      for (var i = 0; i < parts.length; i += 1) {
        var role = parts[i].role;
        if (role === 'user' || role === 'assistant') flat.push(parts[i].text);
      }
      var text = foldQuotes(collapse(deescape(flat.join(LF))));
      proseCache.set(node, text);
      return text;
    }

    function textOf(node) {
      if (node === null || typeof node !== 'object') return '';
      var cached = textCache.get(node);
      if (cached !== undefined) return cached;
      var parts = nodeParts(node);
      var flat = [];
      for (var i = 0; i < parts.length; i += 1) flat.push(parts[i].text);
      var raw = flat.join(LF);
      var text = foldQuotes(collapse(deescape(raw)));
      var projection = foldQuotes(collapse(proseProjection(raw)));
      if (projection.length > 0) text = projection + ' ' + text;
      textCache.set(node, text);
      projectionCache.set(node, projection.length);
      return text;
    }

    /** The role of the block that actually contains the needle: tool arguments and tool
     *  output can both live inside the same assistant step, so the node kind is not enough. */
    function roleAt(node, needle) {
      if (node === null || typeof node !== 'object') return 'other';
      var base = roleOfKind(node.kind);
      if (needle.length === 0) return base;
      var cached = roleHitCache.get(node);
      if (cached === undefined) { cached = new Map(); roleHitCache.set(node, cached); }
      if (cached.has(needle)) return cached.get(needle);
      var parts = nodeParts(node);
      var found = null;
      for (var i = 0; i < parts.length; i += 1) {
        if (normalize(parts[i].text).indexOf(needle) >= 0) { found = parts[i].role; break; }
      }
      if (found === null) found = base;
      cached.set(needle, found);
      return found;
    }

    function snippetOf(text, at, length) {
      var start = Math.max(0, at - 70);
      var end = Math.min(text.length, at + length + 90);
      var body = collapse(text.slice(start, end));
      return (start > 0 ? '…' : '') + body + (end < text.length ? '…' : '');
    }

    function searchNodes(nodes, query, limit, proseOnly, turns, options) {
      var items = [];
      var truncated = false;
      var matcher = buildMatcher(query, options);
      if (matcher === null || !Array.isArray(nodes)) return { items: items, truncated: truncated };
      if (matcher.invalid === true) return { items: items, truncated: truncated, invalid: true, reason: matcher.reason };
      for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];
        var text = proseOnly === true ? proseTextOf(node) : textOf(node);
        if (text.length === 0) continue;
        var first = matcher.find(text, 0);
        if (first === null) continue;
        var count = 1;
        var from = first.at + Math.max(1, first.len);
        while (count < 50) {
          var next = matcher.find(text, from);
          if (next === null) break;
          count += 1;
          from = next.at + Math.max(1, next.len);
        }
        var matchText = text.slice(first.at, first.at + first.len);
        var hitRole = proseOnly === true
          ? (roleOfKind(node.kind) === 'user' ? 'user' : 'assistant')
          : roleAt(node, normalize(matchText.length > 0 ? matchText : matcher.query));
        var derivedTurn = Array.isArray(turns) && Number.isFinite(Number(turns[i])) ? Number(turns[i]) : node.turn;
        items.push({ key: node.key, kind: node.kind, turn: derivedTurn, index: i, count: count, text: text, at: first.at, len: first.len, match: matchText, proseForm: proseOnly === true ? false : first.at < projectionLengthOf(node), role: hitRole });
        if (items.length >= limit) { truncated = true; break; }
      }
      return { items: items, truncated: truncated };
    }

    /** Kinds whose text the transcript renders as prose; payload-only kinds rank later. */
    var MESSAGE_KINDS = ['user', 'assistant-step', 'assistant', 'steering', 'context', 'compaction', 'manual-compaction', 'system-prompt', 'turn-trigger', 'command'];

    function isPayloadKind(kind) { var n = String(kind === undefined || kind === null ? '' : kind); return n.indexOf('tool') >= 0 || kindRank(kind) >= MESSAGE_KINDS.length; }

    /** Markers that say: this line is source code, not what the page draws. A strong marker
     *  never shows up in prose, so one is enough; the weak ones need corroboration. */
    var STRONG_SOURCE = ['+Q+', 'StaticText', 'data-chat-', '=>'];
    var WEAK_SOURCE = ['{' + QUOTE, QUOTE + ':' + QUOTE, BACKSLASH + QUOTE, 'function (', QUOTE + ',' + QUOTE, QUOTE + ':[', '; ', 'const ', 'await '];

    function looksLikeSource(item) {
      var text = String(item.text === undefined ? '' : item.text);
      var at = Number(item.at);
      if (!Number.isFinite(at)) at = 0;
      var slice = text.slice(Math.max(0, at - 200), at + 200);
      var strong = 0;
      var weak = 0;
      for (var i = 0; i < STRONG_SOURCE.length; i += 1) {
        if (slice.indexOf(STRONG_SOURCE[i]) >= 0) strong += 1;
      }
      if (strong > 0) return true;
      for (var j = 0; j < WEAK_SOURCE.length; j += 1) {
        if (slice.indexOf(WEAK_SOURCE[j]) >= 0) weak += 1;
      }
      return weak >= 2;
    }

    function kindRank(kind) {
      var name = String(kind === undefined || kind === null ? '' : kind);
      for (var i = 0; i < MESSAGE_KINDS.length; i += 1) if (name.indexOf(MESSAGE_KINDS[i]) >= 0) return i;
      return MESSAGE_KINDS.length + 1;
    }

    /** One visible sentence lives in several nodes (assistant step, turn tail, tool arguments),
     *  so the same line would otherwise be listed once per node. Fold hits that would render the
     *  same snippet into one row, keeping the node that actually shows prose as the representative. */
    function dedupeHits(found, queryLength) {
      var items = found.items;
      if (!Array.isArray(items) || items.length < 2) return { items: items, truncated: found.truncated, folded: 0, invalid: found.invalid === true, reason: found.reason };
      var groups = new Map();
      var keys = [];
      for (var i = 0; i < items.length; i += 1) {
        var item = items[i];
        var hitLength = Number(item.len);
        var signature = normalize(snippetOf(String(item.text), Number(item.at), Number.isFinite(hitLength) && hitLength > 0 ? hitLength : Number(queryLength)));
        var bucket = groups.get(signature);
        if (bucket === undefined) { groups.set(signature, { best: item, folded: 0, members: [item], turn: item.turn }); keys.push(signature); continue; }
        bucket.folded += 1;
        bucket.members.push(item);
        var candidate = kindRank(item.kind);
        var current = kindRank(bucket.best.kind);
        if (candidate < current || (candidate === current && Number(item.index) < Number(bucket.best.index))) bucket.best = item;
        if (item.proseForm === true && bucket.best.proseForm !== true) bucket.best = item;
      }
      var out = [];
      var folded = 0;
      for (var k = 0; k < keys.length; k += 1) {
        var entry = groups.get(keys[k]);
        /** Grouping follows where the snippet first appears, so a folded row promoted from a
         *  later turn cannot make the turn headings jump backwards. */
        if (entry.best !== undefined) entry.best.turn = entry.turn;
        folded += entry.folded;
        var chosen = entry.best;
        var siblings = [];
        for (var m = 0; m < entry.members.length && siblings.length < 6; m += 1) {
          if (entry.members[m].key !== chosen.key) siblings.push(entry.members[m].key);
        }
        out.push({ key: chosen.key, kind: chosen.kind, turn: chosen.turn, index: chosen.index, count: chosen.count, text: chosen.text, at: chosen.at, len: chosen.len, match: chosen.match, duplicates: entry.folded, alts: siblings, proseForm: chosen.proseForm === true, role: chosen.role });
      }
      /** Prose hits first, payload-only hits after: the visible ones are what the user means. */
      out.sort(function (left, right) {
        if (left.proseForm !== right.proseForm) return left.proseForm ? -1 : 1;
        var delta = kindRank(left.kind) - kindRank(right.kind);
        return delta !== 0 ? delta : Number(left.index) - Number(right.index);
      });
      return { items: out, truncated: found.truncated, folded: folded, invalid: found.invalid === true, reason: found.reason };
    }


    function cssEscape(value) {
      var w = typeof window === 'undefined' ? undefined : window;
      if (w !== undefined && w.CSS !== undefined && typeof w.CSS.escape === 'function') {
        try { return w.CSS.escape(String(value)); } catch (error) { /* fall through to the local escaper */ }
      }
      return escapeAttribute(value);
    }


    var HIGHLIGHT_NAME = 'dsh-session-find';
    var HIGHLIGHT_ALL_NAME = 'dsh-session-find-all';
    var HISTORY_KEY = 'dsh-session-find:history';
    var LAST_QUERY_KEY = 'dsh-session-find:last-query';
    var PROSE_KEY = 'dsh-session-find:prose-only';
    var OPTIONS_KEY = 'dsh-session-find:search-options';
    /** Ranges of the current highlight, re-measured after every correction. */
    var activeMarks = [];

    /** Typographic variants folded 1:1 onto what people actually type, so curly quotes and
     *  full-width spaces still match. Length is preserved, so offsets stay usable. */
    var FOLD = {};
    var FOLD_PAIRS = [[8216, 39], [8217, 39], [8218, 39], [8219, 39], [8242, 39], [8220, 34], [8221, 34], [8222, 34], [8223, 34], [8243, 34], [8208, 45], [8209, 45], [8210, 45], [8211, 45], [8212, 45], [8213, 45], [8722, 45], [160, 32], [12288, 32], [65282, 34], [65287, 39], [12300, 34], [12301, 34], [12302, 34], [12303, 34], [12296, 34], [12297, 34], [12298, 34], [12299, 34]];
    for (var foldIndex = 0; foldIndex < FOLD_PAIRS.length; foldIndex += 1) {
      FOLD[String.fromCharCode(FOLD_PAIRS[foldIndex][0])] = String.fromCharCode(FOLD_PAIRS[foldIndex][1]);
    }

    function foldQuotes(value) {
      var text = String(value === null || value === undefined ? '' : value);
      var out = '';
      for (var i = 0; i < text.length; i += 1) {
        var ch = text.charAt(i);
        out += FOLD[ch] === undefined ? ch : FOLD[ch];
      }
      return out;
    }

    /** Session nodes carry markdown and JSON source, so a rendered sentence can appear as
     *  `\"quoted\"`. Undo the escaping before matching, or searching what the page shows finds nothing. */
    var DEESCAPE = { 110: 32, 114: 32, 116: 32, 34: 34, 39: 39, 47: 47, 92: 92 };
    function deescape(value) {
      var text = String(value === null || value === undefined ? '' : value);
      if (text.indexOf(BACKSLASH) < 0) return text;
      var out = '';
      var i = 0;
      while (i < text.length) {
        var ch = text.charAt(i);
        if (ch !== BACKSLASH || i + 1 >= text.length) { out += ch; i += 1; continue; }
        var code = text.charCodeAt(i + 1);
        if (DEESCAPE[code] !== undefined) { out += String.fromCharCode(DEESCAPE[code]); i += 2; continue; }
        if ((code === 117 || code === 85) && i + 5 < text.length) {
          var hex = text.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 6; continue; }
        }
        out += ch; i += 1;
      }
      return out;
    }
    /** A dsh-ui card is authored as JSON but drawn as prose, so index the strings inside it:
     *  the user searches what the page shows, not the source that renders it. */
    /** True when a string looks like something a person reads, not a key or an identifier. */
    function hasWideText(value) {
      for (var i = 0; i < value.length; i += 1) {
        var code = value.charCodeAt(i);
        if (code >= 19968 && code <= 40959) return true;
        if (code === 32) return true;
      }
      return false;
    }

    function proseProjection(raw) {
      if (raw.indexOf('{"') < 0 && raw.indexOf(BACKSLASH + QUOTE) < 0) return '';
      var runs = [];
      var i = 0;
      while (i < raw.length && runs.length < 300) {
        var open = raw.indexOf(QUOTE, i);
        if (open < 0) break;
        var close = open + 1;
        while (close < raw.length) {
          var ch = raw.charAt(close);
          if (ch === BACKSLASH) { close += 2; continue; }
          if (ch === QUOTE) break;
          close += 1;
        }
        if (close >= raw.length) break;
        var run = raw.slice(open + 1, close);
        if (run.length >= 6 && hasWideText(run)) runs.push(deescape(run));
        i = close + 1;
      }
      return runs.join(' · ');
    }

    function normalize(value) { return foldQuotes(collapse(String(value === null || value === undefined ? '' : value))).toLowerCase(); }

    /** The same folding the scan applies, minus lowercasing: a case-sensitive search must
     *  not compare text that was already flattened. */
    function foldForSearch(value) { return foldQuotes(collapse(String(value === null || value === undefined ? '' : value))); }

    function wordBoundaryOk(text, at, length) {
      var word = /[A-Za-z0-9_]/;
      var before = at > 0 ? text.charAt(at - 1) : '';
      var after = at + length < text.length ? text.charAt(at + length) : '';
      return (before === '' || !word.test(before)) && (after === '' || !word.test(after));
    }

    /** One scan flavour: literal (optionally case-sensitive and whole-word) or regular
     *  expression. Offsets always index the folded node text, which is what the scan sees. */
    function buildMatcher(query, options) {
      var folded = foldForSearch(query);
      var opts = options === undefined || options === null ? {} : options;
      var matchCase = opts.matchCase === true;
      var wholeWord = opts.wholeWord === true;
      if (folded.length === 0) return null;
      if (opts.regex === true) {
        var flags = 'g' + (matchCase ? '' : 'i');
        var source = wholeWord ? '(?<![A-Za-z0-9_])(?:' + folded + ')(?![A-Za-z0-9_])' : folded;
        var pattern = null;
        try { pattern = new RegExp(source, flags); } catch (error) { return { invalid: true, reason: String(error && error.message ? error.message : error) }; }
        return {
          regex: true, literal: false, query: folded,
          find: function (text, from) {
            if (from > text.length) return null;
            pattern.lastIndex = from;
            var match = pattern.exec(text);
            while (match !== null) {
              if (match[0].length > 0) return { at: match.index, len: match[0].length };
              pattern.lastIndex = match.index + 1;
              if (pattern.lastIndex > text.length) return null;
              match = pattern.exec(text);
            }
            return null;
          }
        };
      }
      var needle = matchCase ? folded : folded.toLowerCase();
      var asciiWord = wholeWord && /^[A-Za-z0-9_]+$/.test(folded);
      return {
        regex: false, literal: true, query: folded, needle: needle,
        find: function (text, from) {
          var hay = matchCase ? text : text.toLowerCase();
          var index = Math.max(0, from);
          while (index <= hay.length - needle.length) {
            var at = hay.indexOf(needle, index);
            if (at < 0) return null;
            if (!asciiWord || wordBoundaryOk(text, at, needle.length)) return { at: at, len: needle.length };
            index = at + 1;
          }
          return null;
        }
      };
    }

    function textNodeFilter() { return typeof NodeFilter === 'undefined' ? 4 : NodeFilter.SHOW_TEXT; }

    /** The CSS Custom Highlight registry, read off the global so the local stylesheet
     *  string can never shadow it. */
    function highlightRegistry() {
      if (typeof window === 'undefined' || window.CSS === undefined || window.CSS === null) return null;
      var registry = window.CSS.highlights;
      return registry === undefined || registry === null ? null : registry;
    }

    function highlightConstructor() {
      if (typeof window === 'undefined') return null;
      return typeof window.Highlight === 'function' ? window.Highlight : null;
    }

    /** Concatenate an element's text nodes into one string plus the map back to them.
     *  Markdown splits a phrase across inline nodes, so matching must not be per node. */
    function textMapOf(element) {
      var map = [];
      var parts = [];
      var length = 0;
      if (typeof document === 'undefined' || typeof document.createTreeWalker !== 'function') return { text: '', map: map };
      var walker = document.createTreeWalker(element, textNodeFilter(), null);
      var node = walker.nextNode();
      while (node !== null) {
        var value = String(node.nodeValue === null || node.nodeValue === undefined ? '' : node.nodeValue);
        if (value.length > 0) {
          map.push({ node: node, start: length, end: length + value.length });
          parts.push(value);
          length += value.length;
        }
        node = walker.nextNode();
      }
      return { text: parts.join(''), map: map };
    }

    /** One Range over the concatenated offsets, possibly spanning several text nodes. */
    function rangeAt(map, from, to) {
      var start = null;
      var end = null;
      for (var i = 0; i < map.length; i += 1) {
        var entry = map[i];
        if (start === null && from >= entry.start && from < entry.end) start = { node: entry.node, offset: from - entry.start };
        if (to > entry.start && to <= entry.end) { end = { node: entry.node, offset: to - entry.start }; break; }
      }
      if (start === null || end === null) return null;
      var range = document.createRange();
      try {
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);
      } catch (error) { return null; }
      return range;
    }

    /** Every occurrence of the typed query inside one element, else of the longer
     *  locator snippet: the query is what the user must see coloured. */
    function collectMarks(element, marks) {
      var out = [];
      if (element === null || element === undefined || marks === undefined || marks === null) return out;
      if (typeof document === 'undefined' || typeof document.createRange !== 'function') return out;
      var candidates = [];
      if (marks.query) candidates.push(marks.query);
      if (marks.needle) candidates.push(marks.needle);
      for (var c = 0; c < candidates.length && out.length === 0; c += 1) {
        var needle = normalize(candidates[c]);
        if (needle.length < 2) continue;
        var scanned = textMapOf(element);
        var haystack = foldQuotes(scanned.text).toLowerCase();
        var from = haystack.indexOf(needle);
        while (from >= 0 && out.length < 80) {
          var range = rangeAt(scanned.map, from, from + needle.length);
          if (range !== null) out.push(range);
          from = haystack.indexOf(needle, from + needle.length);
        }
      }
      return out;
    }

    function applyHighlight(ranges) {
      activeMarks = Array.isArray(ranges) ? ranges : [];
      var registry = highlightRegistry();
      var Highlight = highlightConstructor();
      if (registry === null || Highlight === null || activeMarks.length === 0) return;
      try { registry.set(HIGHLIGHT_NAME, new Highlight(...activeMarks)); } catch (error) { /* ignore */ }
    }

    function clearHighlight() {
      activeMarks = [];
      var registry = highlightRegistry();
      if (registry === null || typeof registry.delete !== 'function') return;
      try { registry.delete(HIGHLIGHT_NAME); } catch (error) { /* a host without the API keeps its plain text */ }
    }

    /** Faintly mark every visible occurrence of the query, so the result list maps onto the
     *  transcript at a glance; the current hit keeps its stronger highlight on top. */
    function paintAllMarks(query) {
      var registry = highlightRegistry();
      var Highlight = highlightConstructor();
      if (registry === null || Highlight === null || typeof document === 'undefined') return;
      var needle = normalize(query);
      var ranges = [];
      if (needle.length >= 2) {
        var rows = document.querySelectorAll('[data-chat-node-key]');
        for (var i = 0; i < rows.length && ranges.length < 240; i += 1) {
          var found = collectMarks(rows[i], { query: query });
          for (var k = 0; k < found.length && ranges.length < 240; k += 1) ranges.push(found[k]);
        }
      }
      try {
        if (ranges.length === 0) registry.delete(HIGHLIGHT_ALL_NAME);
        else registry.set(HIGHLIGHT_ALL_NAME, new Highlight(...ranges));
      } catch (error) { /* ignore */ }
    }

    function clearAllMarks() {
      var registry = highlightRegistry();
      if (registry === null || typeof registry.delete !== 'function') return;
      try { registry.delete(HIGHLIGHT_ALL_NAME); } catch (error) { /* ignore */ }
    }

    function readSearchOptions() {
      var fallback = { regex: false, matchCase: false, wholeWord: false };
      try {
        var raw = window.localStorage.getItem(OPTIONS_KEY);
        if (typeof raw !== 'string' || raw.length === 0) return fallback;
        var parsed = JSON.parse(raw);
        return { regex: parsed.regex === true, matchCase: parsed.matchCase === true, wholeWord: parsed.wholeWord === true };
      } catch (error) { return fallback; }
    }

    function readHistory() {
      try {
        var raw = window.localStorage.getItem(HISTORY_KEY);
        var parsed = raw === null ? [] : JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(function (value) { return typeof value === 'string' && value.length > 0; }).slice(0, 12);
      } catch (error) { return []; }
    }

    /** Rectangle of the highlighted match itself, so tall rows are centred on the hit
     *  rather than on the message. */
    function currentRect(element) {
      var range = activeMarks[0];
      if (range !== undefined && range !== null && typeof range.getBoundingClientRect === 'function') {
        try {
          /** Only trust the mark rect when that mark lives inside this row: a sibling row
           *  rendering the same sentence must not move the landing. */
          var probe = range.commonAncestorContainer !== undefined ? range.commonAncestorContainer : range.startContainer;
          var inside = element !== null && element !== undefined && typeof element.contains === 'function' && probe !== undefined && probe !== null && (element === probe || element.contains(probe));
          var markRect = range.getBoundingClientRect();
          var elRect2 = element !== null && element !== undefined && typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
          var invisible = elRect2 === null || elRect2 === undefined || elRect2.height === 0;
          if ((inside || invisible) && markRect !== null && markRect !== undefined && markRect.height > 0) return markRect;
          if (inside) {
            if (markRect !== null && markRect !== undefined && markRect.height > 0) return markRect;
          }
        } catch (error) { /* fall back to the element */ }
      }
      if (element === null || element === undefined || typeof element.getBoundingClientRect !== 'function') return null;
      return element.getBoundingClientRect();
    }

    /** One node can be drawn across several rows, so the searched sentence may be rendered by
     *  a sibling row of the same turn. Highlight it there, but never move the landing: every
     *  result must jump to its own node. */
    function sameTurnHighlight(element, marks) {
      if (element === null || element === undefined || typeof element.closest !== 'function') return [];
      var scope = element.closest('[data-chat-turn]');
      if (scope === null || scope === undefined) scope = element.parentElement;
      while (scope !== null && scope !== undefined && scope.querySelectorAll !== undefined && scope.querySelectorAll('[data-chat-node-key]').length < 2 && scope.parentElement !== null) scope = scope.parentElement;
      if (scope === null || scope === undefined || scope === element) return [];
      /** collectMarks walks all text nodes and concatenates them, so cross-node text
       *  (card titles split by inline elements) is matched correctly. */
      var found = collectMarks(scope, marks);
      if (found.length > 0) return found;
      /** GenUI cards can render in a portal outside the turn container, so fall back to
       *  the whole scroller. This only paints a highlight; it never moves the landing. */
      var scroller = chatScroller();
      if (scroller !== null && scroller !== undefined && scroller !== scope) return collectMarks(scroller, marks);
      return [];
    }

    function placeInto(box, element) {
      if (box === null || box === undefined || typeof box.getBoundingClientRect !== 'function') return;
      var target = currentRect(element);
      if (target === null) return;
      var boxRect = box.getBoundingClientRect();
      var delta = (target.top + target.height / 2) - (boxRect.top + boxRect.height / 2);
      if (Math.abs(delta) > 1) box.scrollTop = box.scrollTop + delta;
    }

    /** The app may re-anchor the list right after a programmatic scroll: measure the
     *  match again and correct once, so the hit really ends up on screen. */
    function verifyPlacement(box, element, marks) {
      if (box === null || element === null || element === undefined) return Promise.resolve();
      return settle().then(function () {
        if (box === null || typeof box.getBoundingClientRect !== 'function') return;
        var boxRect = box.getBoundingClientRect();
        var target = currentRect(element);
        if (target === null) return;
        if (target.top >= boxRect.top && target.bottom <= boxRect.bottom) return;
        var delta = (target.top + target.height / 2) - (boxRect.top + boxRect.height / 2);
        if (Math.abs(delta) > 1) box.scrollTop = box.scrollTop + delta;
        var own = collectMarks(element, marks);
        applyHighlight(own.length > 0 ? own : sameTurnHighlight(element, marks));
      });
    }

    /** Highlight, centre the hit, then confirm it stayed centred. */
    function show(box, element, flashIt, marks) {
      if (element === null || element === undefined) return Promise.resolve(null);
      applyHighlight(collectMarks(element, marks));
      var away = false;
      if (activeMarks.length === 0) {
        var nearby = sameTurnHighlight(element, marks);
        if (nearby.length > 0) { applyHighlight(nearby); away = true; }
      }
      /** Landing always centres on this result own row; a nearby highlight is only painted,
       *  never allowed to drag the scroll position (or several results pile up on one spot). */
      placeInto(box, element);
      if (flashIt !== false) flash(element);
      traceVerbose('text textLen=' + (typeof element.textContent === 'string' ? element.textContent.length : -1) + ' hasQuery=' + (typeof element.textContent === 'string' && String(marks && marks.query).length > 0 ? element.textContent.indexOf(String(marks.query)) >= 0 : false) + ' hasNeedle=' + (typeof element.textContent === 'string' && marks && marks.needle ? element.textContent.indexOf(String(marks.needle).slice(0, 12)) >= 0 : false) + ' collapsed=' + (typeof element.querySelectorAll === 'function' ? element.querySelectorAll('button[aria-expanded=false]').length : -1) + ' textNodes=' + (function () { try { var w = document.createTreeWalker(element, typeof NodeFilter === 'undefined' ? 4 : NodeFilter.SHOW_TEXT, null); var n = 0; var x = w.nextNode(); while (x !== null && n < 5000) { n += 1; x = w.nextNode(); } return n; } catch (e) { return -1; } })());
      var rect = currentRect(element);
      trace('show exact=' + (flashIt !== false) + ' away=' + away + ' marks=' + activeMarks.length + ' rectTop=' + (rect === null ? 'null' : Math.round(rect.top)) + ' rectH=' + (rect === null ? -1 : Math.round(rect.height)) + ' boxRect=' + JSON.stringify(box === null ? null : (function () { var r = box.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), scroll: Math.round(box.scrollTop), sh: box.scrollHeight, ch: box.clientHeight }; })()) + ' rowKey=' + (typeof element.getAttribute === 'function' ? String(element.getAttribute('data-chat-node-key')) : '?'));
      return verifyPlacement(box, element, marks).then(function () {
        trace('after-verify top=' + (box === null ? -1 : Math.round(box.scrollTop)) + ' marks=' + activeMarks.length);
        return { exact: flashIt !== false, highlighted: activeMarks.length > 0, element: element };
      });
    }

    function flash(element) {
      if (element === null || element === undefined || element.classList === undefined) return;
      element.classList.add('dsh-session-find-flash');
      window.setTimeout(function () { element.classList.remove('dsh-session-find-flash'); }, 1600);
    }

    function findNodeElement(key) {
      if (typeof document === 'undefined') return null;
      try { return document.querySelector('[data-chat-node-key=' + QUOTE + cssEscape(key) + QUOTE + ']'); } catch (error) { return null; }
    }

    function chatScroller() {
      if (typeof document === 'undefined') return null;
      var flow = document.querySelector('[data-chat-flow]');
      var el = flow === null ? null : flow.parentElement;
      while (el !== null && el !== undefined && el !== document.body) {
        var style = window.getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight - el.clientHeight > 8) return el;
        el = el.parentElement;
      }
      return null;
    }

    function settle() {
      return new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { setTimeout(resolve, 30); });
        });
      });
    }

    /** Mounted Turn range, the direction signal for the deep search. */
    function mountedTurnWindow(box) {
      if (box === null || box === undefined || typeof box.querySelectorAll !== 'function') return null;
      var rows = box.querySelectorAll('[data-chat-turn]');
      var min = Infinity;
      var max = -Infinity;
      for (var i = 0; i < rows.length; i += 1) {
        var value = Number(rows[i].getAttribute('data-chat-turn'));
        if (!Number.isFinite(value)) continue;
        if (value < min) min = value;
        if (value > max) max = value;
      }
      return min === Infinity ? null : { min: min, max: max };
    }

    /** Nearest Turn around one node index: plenty of rows carry no Turn of their own. */
    function nearestTurn(nodes, index) {
      if (!Array.isArray(nodes) || !Number.isFinite(index)) return null;
      for (var distance = 0; distance < nodes.length; distance += 1) {
        var before = index - distance;
        var after = index + distance;
        if (before >= 0 && nodes[before] !== null && nodes[before] !== undefined) {
          var a = Number(nodes[before].turn);
          if (Number.isFinite(a)) return a;
        }
        if (after < nodes.length && nodes[after] !== null && nodes[after] !== undefined) {
          var b = Number(nodes[after].turn);
          if (Number.isFinite(b)) return b;
        }
      }
      return null;
    }

    /** Render order of the chat rows, cached by the array identity the store hands out. */
    var rankCache = { order: null, map: null };

    function rankMapOf(order) {
      if (!Array.isArray(order)) return null;
      if (rankCache.order === order && rankCache.map !== null) return rankCache.map;
      var map = new Map();
      for (var i = 0; i < order.length; i += 1) map.set(String(order[i]), i);
      rankCache.order = order;
      rankCache.map = map;
      return map;
    }

    function rowKeyOf(row) {
      if (row === null || row === undefined || typeof row.getAttribute !== 'function') return null;
      var key = row.getAttribute('data-chat-node-key');
      return key === null || key === undefined ? null : String(key);
    }

    /** Mounted render-order window: the precise direction signal, independent of text. */
    function mountedRankWindow(box, rankOf) {
      if (box === null || box === undefined || typeof box.querySelectorAll !== 'function' || rankOf === null) return null;
      var rows = box.querySelectorAll('[data-chat-node-key]');
      var min = Infinity;
      var max = -Infinity;
      for (var i = 0; i < rows.length; i += 1) {
        var rank = rankOf.get(rowKeyOf(rows[i]));
        if (rank === undefined) continue;
        if (rank < min) min = rank;
        if (rank > max) max = rank;
      }
      return min === Infinity ? null : { min: min, max: max };
    }

    function turnRowElement(turn) {
      if (!Number.isFinite(Number(turn)) || typeof document === 'undefined') return null;
      try { return document.querySelector('[data-chat-turn=' + QUOTE + cssEscape(String(Number(turn))) + QUOTE + ']'); } catch (error) { return null; }
    }

    /**
     * Rows whose text contains the snippet (else the query). Matching by text is only a
     * fallback, so it must not collapse duplicates onto one row: rows inside the target
     * Turn win, and among them the row whose render rank is nearest the hit's own rank.
     */
    function findByContent(box, marks, turn, wantRank) {
      if (box === null || box === undefined || typeof box.querySelectorAll !== 'function') return null;
      if (marks === undefined || marks === null) return null;
      var candidates = [];
      if (marks.needle) candidates.push(marks.needle);
      if (marks.query) candidates.push(marks.query);
      var rows = box.querySelectorAll('[data-chat-node-key]');
      var wanted = Number.isFinite(Number(turn)) ? '[data-chat-turn=' + QUOTE + cssEscape(String(Number(turn))) + QUOTE + ']' : null;
      var rankOf = rankMapOf(marks.order);
      var rankWanted = Number(wantRank);
      for (var c = 0; c < candidates.length; c += 1) {
        var target = normalize(candidates[c]);
        if (target.length < 2) continue;
        var best = null;
        var bestScore = Infinity;
        for (var i = 0; i < rows.length; i += 1) {
          var row = rows[i];
          if (normalize(row.textContent).indexOf(target) < 0) continue;
          var inTurn = wanted === null ? true : (typeof row.closest === 'function' && row.closest(wanted) !== null);
          var score = inTurn ? 0 : 100000;
          if (rankOf !== null && Number.isFinite(rankWanted)) {
            var rank = rankOf.get(rowKeyOf(row));
            if (rank !== undefined) score += Math.abs(rank - rankWanted);
          }
          if (score < bestScore) { best = row; bestScore = score; }
        }
        if (best !== null) return best;
      }
      return null;
    }

    /** Slice of the hit text used to find the row again among the mounted ones. */
    function needleOf(text, at, length) {
      var size = Math.max(24, Math.min(80, Number(length) + 40));
      var start = Math.max(0, Math.min(Number(at), text.length - 1));
      return text.slice(start, Math.min(text.length, start + size));
    }

    /** Open collapsed disclosure controls inside one row so its hidden members render.
     *  Only aria-expanded toggles are touched: that attribute belongs to disclosures. */
    function expandCollapsed(element, limit) {
      if (element === null || element === undefined || typeof element.querySelectorAll !== 'function') return 0;
      var toggles = element.querySelectorAll('button[aria-expanded=false]');
      var opened = 0;
      var most = limit === undefined ? 4 : limit;
      for (var i = 0; i < toggles.length && opened < most; i += 1) {
        try { toggles[i].click(); opened += 1; } catch (error) { /* a hostile control must not stop the jump */ }
      }
      return opened;
    }

    /** Expand what the row hides, then look again: the member node only exists in the DOM
     *  while its disclosure is open, and its own key is the exact identity to trust. */
    function openThenFind(box, row, key, marks, turn, wantRank, depth) {
      var opened = expandCollapsed(row);
      var attempt = function () {
        var exact = findNodeElement(key);
        if (exact !== null) return show(box, exact, true, marks);
        if (opened === 0) return Promise.resolve(null);
        var nearby = findByContent(box, marks, turn, wantRank);
        if (nearby !== null) return show(box, nearby, false, marks);
        if (depth < 3) return openThenFind(box, row, key, marks, turn, wantRank, depth + 1);
        return Promise.resolve(null);
      };
      if (opened === 0) return attempt();
      return settle().then(attempt);
    }

    /** Per-step tracing is off by default; flip to true to diagnose a real-machine jump. */
    var VERBOSE = false;

    function emit(message, enabled) {
      try {
        if (!enabled) return;
        if (typeof console === 'undefined' || typeof console.log !== 'function') return;
        console.log('[next-ui-diagnostic] session-find ' + String(message).slice(0, 900));
      } catch (error) { /* tracing must never break the search */ }
    }

    /** Key events only: one or two lines per jump, so a failure leaves evidence without spam.
     *  The prefix is the one main.js forwards into ~/.dsh/logs/desktop-next.log. */
    function trace(message) { emit(message, true); }

    /** Step-by-step detail for real-machine diagnosis. */
    function traceVerbose(message) { emit(message, VERBOSE); }

    function rowKeysBrief(rows, limit) {
      var out = [];
      if (rows === null || rows === undefined || typeof rows.length !== 'number') return out;
      for (var i = 0; i < rows.length && out.length < (limit === undefined ? 5 : limit); i += 1) {
        var key = rowKeyOf(rows[i]);
        out.push(key === null ? '?' : key);
      }
      return out;
    }

    /** Ancestor chain of the chat flow: overflowY plus scrollable overflow, to prove the scroller. */
    function scrollerChain() {
      if (typeof document === 'undefined') return 'no-document';
      var flow = document.querySelector('[data-chat-flow]');
      if (flow === null) return 'no-flow';
      var el = flow.parentElement;
      var out = [];
      var depth = 0;
      while (el !== null && el !== undefined && el !== document.body && depth < 6) {
        var style = window.getComputedStyle(el);
        out.push(style.overflowY + '+' + (el.scrollHeight - el.clientHeight));
        el = el.parentElement;
        depth += 1;
      }
      return out.join(' > ');
    }
    /** One node can render as several rows (reasoning gets its own row), so the row that owns
     *  the key often holds only part of the text. Prefer whichever mounted row actually shows
     *  the matched text: otherwise there is nothing to highlight and centring looks wrong. */
    /** Where is the matched text actually rendered? The transcript splits one node across
     *  several rows (reasoning renders as its own 思考 row), and those rows do not always carry
     *  a node key, so search the mounted text nodes and take the element nearest the hit row. */
    function findTextOwner(box, marks, anchor) {
      if (box === null || box === undefined || typeof document === 'undefined') return null;
      if (typeof document.createTreeWalker !== 'function') return null;
      var wanted = [];
      if (marks !== undefined && marks !== null) {
        if (marks.query) wanted.push(normalize(marks.query));
        if (marks.needle) wanted.push(normalize(marks.needle).slice(0, 20));
      }
      var anchorRect = anchor !== null && anchor !== undefined && typeof anchor.getBoundingClientRect === "function" ? anchor.getBoundingClientRect() : null;
      var walker = document.createTreeWalker(box, textNodeFilter(), null);
      var node = walker.nextNode();
      var best = null;
      var bestDistance = Infinity;
      var scanned = 0;
      while (node !== null && scanned < 20000) {
        scanned += 1;
        var value = normalize(node.nodeValue);
        if (value.length >= 2) {
          for (var w = 0; w < wanted.length; w += 1) {
            if (wanted[w].length >= 2 && value.indexOf(wanted[w]) >= 0) {
              var host = node.parentElement;
              if (host === null || host === undefined) break;
              var row = typeof host.closest === "function" ? (host.closest('[data-chat-node-key]') || host) : host;
              var rect = typeof row.getBoundingClientRect === "function" ? row.getBoundingClientRect() : null;
              var distance = anchorRect === null || rect === null ? 0 : Math.abs((rect.top + rect.height / 2) - (anchorRect.top + anchorRect.height / 2));
              if (distance < bestDistance) { bestDistance = distance; best = row; }
              break;
            }
          }
        }
        node = walker.nextNode();
      }
      return best;
    }
    /** One reveal at a time: a newer jump invalidates the running one. */
    var revealToken = 0;

    /**
     * Reveal one hit. The search only trusts the node's own key while scrolling; text
     * matching is confined to the target Turn and disambiguated by render rank, because
     * injected context repeats the same text in many nodes.
     */
    function revealNode(key, context) {
      var token = ++revealToken;
      var stale = function () { return token !== revealToken; };
      var ctx = context === undefined || context === null ? {} : context;
      var marks = { query: ctx.query, needle: ctx.needle, order: ctx.order };
      var rankOf = rankMapOf(ctx.order);
      var wantRank = rankOf === null ? undefined : rankOf.get(String(key));
      var turn = Number(ctx.turn);
      if (!Number.isFinite(turn)) turn = nearestTurn(ctx.nodes, Number(ctx.index));

      var direct = findNodeElement(key);
      var directBox = direct === null ? null : chatScroller();
      if (direct !== null) {
        /** A merged row stands for several nodes. If this node does not render the sentence,
         *  a folded sibling usually does — try those, then accept a text-less landing. */
        var ownMarks = collectMarks(direct, marks).length;
        var foldedAlts = Array.isArray(ctx.alts) ? ctx.alts : [];
        var taken = Array.isArray(ctx.primaries) ? ctx.primaries : [];
        if (ownMarks === 0) {
          for (var ai = 0; ai < foldedAlts.length && ai < 6; ai += 1) {
            var altRow = findNodeElement(foldedAlts[ai]);
            if (taken.indexOf(foldedAlts[ai]) >= 0) continue;
            if (altRow !== null && collectMarks(altRow, marks).length > 0) {
              trace('alt hit key=' + String(key) + ' -> ' + String(foldedAlts[ai]));
              return show(directBox, altRow, true, marks);
            }
          }
        }
        trace('direct hit key=' + String(key) + ' marks=' + ownMarks);
        return show(directBox, direct, true, marks);
      }
      var box = chatScroller();
      if (box === null) { trace('env box=0 chain ' + scrollerChain()); return Promise.resolve(null); }
      var span = box.scrollHeight - box.clientHeight;
      if (span <= 0) return Promise.resolve(null);
      var startRows = box.querySelectorAll('[data-chat-node-key]');
      var keysInOrder = 0;
      for (var sr = 0; sr < startRows.length; sr += 1) if (rankOf !== null && rankOf.get(rowKeyOf(startRows[sr])) !== undefined) keysInOrder += 1;
      trace('env box=1 span=' + span + ' clientH=' + box.clientHeight + ' rows=' + startRows.length + ' keysInOrder=' + keysInOrder + ' wantRank=' + String(wantRank) + ' turn=' + String(turn) + ' orderLen=' + (Array.isArray(ctx.order) ? ctx.order.length : -1) + ' nodes=' + (Array.isArray(ctx.nodes) ? ctx.nodes.length : -1));
      traceVerbose('env chain ' + scrollerChain());

      var lo = 0;
      var hi = span;
      var guess = Math.round(span / 2);
      var turnMax = Number(ctx.turnMax);
      if (wantRank !== undefined && Array.isArray(ctx.order) && ctx.order.length > 1) guess = Math.round(span * (wantRank / (ctx.order.length - 1)));
      else if (Number.isFinite(turn) && Number.isFinite(turnMax) && turnMax > 1) guess = Math.round(span * ((turn - 1) / (turnMax - 1)));
      else if (Number.isFinite(Number(ctx.index)) && Number(ctx.total) > 1) guess = Math.round(span * (Number(ctx.index) / (Number(ctx.total) - 1)));

      var probeSeq = 0;
      var probe = function (offset) {
        probeSeq += 1;
        var seq = probeSeq;
        box.scrollTop = Math.max(0, Math.min(span, offset));
        var want = Math.round(box.scrollTop);
        return settle().then(function () {
          if (stale()) return null;
          var hit = findNodeElement(key);
          traceVerbose('probe#' + seq + ' want=' + want + ' now=' + Math.round(box.scrollTop) + ' keyFound=' + (hit !== null));
          if (hit !== null) return show(box, hit, true, marks);
          return undefined;
        });
      };

      var step = function (round) {
        if (stale() || round > 12) return Promise.resolve(null);
        return probe(guess).then(function (found) {
          if (found) return found;
          if (found === null || stale()) return null;
          var seenRows = box.querySelectorAll('[data-chat-node-key]');
          traceVerbose('mounted rows=' + seenRows.length + ' ' + rowKeysBrief(seenRows).join('|') + ' turns=' + JSON.stringify(mountedTurnWindow(box)) + ' rankWin=' + JSON.stringify(wantRank !== undefined ? mountedRankWindow(box, rankOf) : null));
          var unit = null;
          var low = null;
          var high = null;
          if (wantRank !== undefined) {
            var ranks = mountedRankWindow(box, rankOf);
            if (ranks !== null) { low = ranks.min; high = ranks.max; unit = wantRank; }
          }
          if (low === null && Number.isFinite(turn)) {
            var turns = mountedTurnWindow(box);
            if (turns !== null) { low = turns.min; high = turns.max; unit = turn; }
          }
          if (low === null) {
            var anyRows = box.querySelectorAll('[data-chat-node-key]');
            if (anyRows.length === 0) return null;
            return openThenFind(box, anyRows[0], key, marks, turn, wantRank, 0);
          }
          if (unit < low) hi = Math.min(hi, guess);
          else if (unit > high) lo = Math.max(lo, guess);
          else {
            var row = turnRowElement(turn);
            if (row === null) {
              var rowsNow = box.querySelectorAll('[data-chat-node-key]');
              row = rowsNow.length === 0 ? null : rowsNow[0];
            }
            if (row === null) return null;
            return openThenFind(box, row, key, marks, turn, wantRank, 0);
          }
          if (hi - lo <= 8) return null;
          var next = Math.round((lo + hi) / 2);
          if (next === guess) return null;
          guess = next;
          return step(round + 1);
        });
      };

      return step(0).then(function (outcome) {
        trace('end=' + (outcome === null ? 'none' : (outcome.exact ? 'exact' : 'approx')) + ' top=' + Math.round(box.scrollTop) + ' keyInDom=' + (findNodeElement(key) !== null));
        if (outcome || stale()) return outcome;
        var row = turnRowElement(turn);
        if (row === null) {
          var nearby = findByContent(box, marks, turn, wantRank);
          return nearby === null ? null : show(box, nearby, false, marks);
        }
        return openThenFind(box, row, key, marks, turn, wantRank, 0);
      });
    }

    var STYLES = '.dsh-session-find-more{display:block;width:100%;margin:2px 0 0;padding:6px 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa0a6);font-size:12px;text-align:left;cursor:pointer}.dsh-session-find-more:hover{background:var(--dsw-alias-bg-hover,rgba(255,255,255,.06))}.dsh-session-find-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa0a6);cursor:pointer;padding:0}.dsh-session-find-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.16));color:var(--dsw-alias-label-primary,#e8eaed)}.dsh-session-find-panel{position:fixed;top:88px;right:20px;width:min(820px,calc(100vw - 40px));max-height:calc(100vh - 120px);z-index:2147483000;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:14px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.28));background:var(--dsw-alias-bg-layer-2,#202124);box-shadow:0 16px 40px rgba(0,0,0,.36);color:var(--dsw-alias-label-primary,#e8eaed);font-size:13px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}.dsh-session-find-row{display:flex;align-items:center;gap:6px}.dsh-session-find-input{flex:1;min-width:0;height:30px;padding:0 9px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.28));background:var(--dsw-alias-bg-base,transparent);color:inherit;font:inherit;outline:none}.dsh-session-find-input:focus{border-color:var(--dsw-alias-border-l1,rgba(127,127,127,.5))}.dsh-session-find-icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa0a6);cursor:pointer;padding:0}.dsh-session-find-icon:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.16));color:var(--dsw-alias-label-primary,#e8eaed)}.dsh-session-find-icon[disabled]{opacity:.4;cursor:default}.dsh-session-find-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--dsw-alias-label-tertiary,#8b9096)}.dsh-session-find-scope{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.dsh-session-find-scope-btn{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.28));border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary,#9aa0a6);font:inherit;font-size:11.5px;line-height:1.6;cursor:pointer}.dsh-session-find-scope-btn:hover{color:var(--dsw-alias-label-primary,#e8eaed)}.dsh-session-find-scope-btn[data-on=true]{border-color:rgba(96,165,250,.55);background:rgba(96,165,250,.14);color:#8ab4f8}.dsh-session-find-scope-dot{flex:none;width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.55}.dsh-session-find-scope-btn[data-on=true] .dsh-session-find-scope-dot{opacity:1}.dsh-session-find-scope-hint{font-size:11px;color:var(--dsw-alias-label-tertiary,#8b9096)}.dsh-session-find-filters{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.dsh-session-find-filter{border:1px solid transparent;border-radius:999px;background:var(--dsw-alias-bg-layer-3,rgba(127,127,127,.12));color:var(--dsw-alias-label-secondary,#9aa0a6);font:inherit;font-size:11.5px;line-height:19px;padding:0 9px;cursor:pointer}.dsh-session-find-filter:hover{color:var(--dsw-alias-label-primary,#e8eaed)}.dsh-session-find-filter[data-on=true]{background:var(--dsw-alias-bg-layer-2,#2b2d31);border-color:var(--dsw-alias-border-l1,rgba(127,127,127,.5));color:var(--dsw-alias-label-primary,#e8eaed);font-weight:600}.dsh-session-find-group{list-style:none;margin:8px 0 0;padding:0 4px;font-size:11px;line-height:16px;letter-spacing:.03em;color:var(--dsw-alias-label-tertiary,#8b9096)}.dsh-session-find-meta-link{border:0;background:transparent;padding:0;font:inherit;color:#8ab4f8;cursor:pointer;text-decoration:underline;text-underline-offset:2px}.dsh-session-find-meta-link:hover{color:#aecbfa}.dsh-session-find-list{margin:0;padding:0;list-style:none;max-height:min(64vh,760px);overflow:auto;display:flex;flex-direction:column;gap:4px}.dsh-session-find-hit{display:block;width:100%;text-align:left;border:1px solid transparent;border-radius:9px;background:transparent;color:inherit;cursor:pointer;padding:7px 10px 9px;font-size:13px;line-height:19px}.dsh-session-find-hit:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.16))}.dsh-session-find-hit[data-active=true]{background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.24));border-color:var(--dsw-alias-border-l2,rgba(127,127,127,.28))}.dsh-session-find-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:3px}.dsh-session-find-chip{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:999px;background:var(--dsw-alias-bg-layer-3,rgba(127,127,127,.14));color:var(--dsw-alias-label-secondary,#9aa0a6);font-size:11px;line-height:17px;padding:0 7px}.dsh-session-find-chip[data-role=user]{background:rgba(96,165,250,.18);color:#8ab4f8}.dsh-session-find-chip[data-role=assistant]{background:rgba(74,222,128,.16);color:#81c995}.dsh-session-find-chip[data-role=reasoning]{background:rgba(167,139,250,.18);color:#c4b5fd}.dsh-session-find-chip[data-role=toolCall]{background:rgba(251,191,36,.18);color:#f7c948}.dsh-session-find-chip[data-role=toolResult]{background:rgba(45,212,191,.18);color:#5eead4}.dsh-session-find-chip[data-role=system]{background:rgba(148,163,184,.18);color:#a8b3c1}.dsh-session-find-snippet{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;color:var(--dsw-alias-label-primary,#e8eaed)}.dsh-session-find-q{background-color:rgba(255,190,60,.42);border-radius:3px;color:inherit;font-weight:600}::highlight(dsh-session-find){background-color:rgba(255,190,60,.45);color:inherit}::highlight(dsh-session-find-all){background-color:rgba(255,190,60,.18)}.dsh-session-find-flash{animation:dsh-session-find-pulse 1.6s ease-out 1}@keyframes dsh-session-find-pulse{0%{background-color:var(--dsw-alias-interactive-bg-active,rgba(120,170,255,.35))}100%{background-color:transparent}}.dsh-session-find-bad{color:#f28b82}.dsh-session-find-opt-glyph{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px;opacity:.85}';

    function makeFindBar(t, ui) {
      function iconButton(label, path, onClick, disabled) {
        return h('button', {
          type: 'button', className: 'dsh-session-find-icon', title: label, 'aria-label': label,
          disabled: disabled === true, onClick: onClick
        }, h('svg', { viewBox: '0 0 16 16', width: 15, height: 15, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }, path));
      }

      var ROLES = ['user', 'assistant', 'reasoning', 'toolCall', 'toolResult', 'system', 'other'];

      function roleLabel(role) {
        if (role === 'user') return t('roleUser');
        if (role === 'assistant') return t('roleAssistant');
        if (role === 'reasoning') return t('roleReasoning');
        if (role === 'toolCall') return t('roleToolCall');
        if (role === 'toolResult') return t('roleToolResult');
        if (role === 'system') return t('roleSystem');
        return t('roleOther');
      }

      function roleOfResult(result) {
        if (result === null || result === undefined) return 'other';
        if (result.role !== undefined && result.role !== null && String(result.role) !== '') return String(result.role);
        return roleOfKind(result.kind);
      }

      function HitButton(props) {
        var result = props.result;
        var hitLength = Number(result.len);
        if (!Number.isFinite(hitLength) || hitLength <= 0) hitLength = normalize(props.query).length;
        var needle = normalize(result.match !== undefined && result.match !== null && String(result.match).length > 0 ? result.match : props.query);
        var snippet = snippetOf(result.text, result.at, hitLength);
        var at = needle.length === 0 ? -1 : snippet.toLowerCase().indexOf(needle);
        var body = [];
        if (at < 0) body.push(snippet);
        else {
          body.push(snippet.slice(0, at));
          body.push(h('span', { key: 'q', className: 'dsh-session-find-q' }, snippet.slice(at, at + (hitLength > 0 ? hitLength : needle.length))));
          body.push(snippet.slice(at + (hitLength > 0 ? hitLength : needle.length)));
        }
        var role = roleOfResult(result);
        var chips = [];
        chips.push(h('span', { key: 'role', className: 'dsh-session-find-chip', 'data-role': role }, roleLabel(role)));
        if (Number.isFinite(Number(result.turn))) {
          chips.push(h('span', { key: 'turn', className: 'dsh-session-find-chip' }, t('turn', { n: Number(result.turn) })));
        }
        if (Number(result.duplicates) > 0) {
          chips.push(h('span', { key: 'dup', className: 'dsh-session-find-chip' }, t('sameText', { n: Number(result.duplicates) + 1 })));
        }
        if (Number(result.count) > 1) {
          chips.push(h('span', { key: 'count', className: 'dsh-session-find-chip' }, t('hits', { n: Number(result.count) })));
        }
        return h('button', {
          type: 'button', className: 'dsh-session-find-hit', 'data-active': props.active ? 'true' : 'false',
          onClick: function () { props.onPick(props.index); }
        }, h('span', { className: 'dsh-session-find-chips' }, chips),
          h('span', { className: 'dsh-session-find-snippet' }, body));
      }

      return function SessionFind(props) {
        var useChat = props.useChat;
        var order = typeof useChat === 'function'
          ? useChat(function (state) { return state !== null && typeof state === 'object' ? state.order : undefined; })
          : undefined;
        var nodeStore = typeof useChat === 'function'
          ? useChat(function (state) { return state !== null && typeof state === 'object' ? state.nodes : undefined; })
          : undefined;
        var legacyNodes = typeof useChat === 'function'
          ? useChat(function (state) { return state !== null && typeof state === 'object' && state.legacy !== undefined ? state.legacy.nodes : undefined; })
          : undefined;
        var nodesCacheRef = React.useRef({ order: null, store: null, legacy: null, nodes: [], turns: [] });
        var nodeCache = nodesCacheRef.current;
        if (nodeCache.order !== order || nodeCache.store !== nodeStore || nodeCache.legacy !== legacyNodes) {
          var canonical = [];
          if (Array.isArray(order) && nodeStore !== null && nodeStore !== undefined && typeof nodeStore.get === 'function') {
            for (var nodeIndex = 0; nodeIndex < order.length; nodeIndex += 1) {
              var canonicalNode = nodeStore.get(order[nodeIndex]);
              if (canonicalNode !== null && canonicalNode !== undefined) canonical.push(canonicalNode);
            }
          } else if (Array.isArray(legacyNodes)) canonical = legacyNodes;
          var turnMarks = new Array(canonical.length);
          var userTurns = 0;
          for (var turnIndex = 0; turnIndex < canonical.length; turnIndex += 1) {
            var turnNode = canonical[turnIndex];
            if (turnNode !== null && turnNode !== undefined && String(turnNode.kind) === 'user') userTurns += 1;
            turnMarks[turnIndex] = userTurns;
          }
          nodeCache = { order: order, store: nodeStore, legacy: legacyNodes, nodes: canonical, turns: turnMarks };
          nodesCacheRef.current = nodeCache;
        }
        var nodes = nodeCache.nodes;
        var revisionState = React.useState(0);
        var setRevision = revisionState[1];
        var queryState = React.useState(function () {
          try {
            var remembered = window.localStorage.getItem(LAST_QUERY_KEY);
            return typeof remembered === 'string' ? remembered : '';
          } catch (error) { return ''; }
        });
        var query = queryState[0];
        var setQuery = queryState[1];
        var resultState = React.useState({ items: [], truncated: false });
        var results = resultState[0];
        var setResults = resultState[1];
        var activeState = React.useState(0);
        var active = activeState[0];
        var setActive = activeState[1];
        var noticeState = React.useState('');
        var payloadState = React.useState(false);
        var notice = noticeState[0];
        var setNotice = noticeState[1];
        var showPayload = payloadState[0];
        var setPayload = payloadState[1];
        var filterState = React.useState('');
        var roleFilterOn = filterState[0];
        var setFilter = filterState[1];
        var proseState = React.useState(function () {
          try {
            var stored = window.localStorage.getItem('dsh-session-find:prose-only');
            return stored === null ? true : stored === '1';
          } catch (error) { return true; }
        });
        var proseOnly = proseState[0];
        var setProseOnly = proseState[1];
        var outsideState = React.useState(0);
        var outside = outsideState[0];
        var setOutside = outsideState[1];
        var optionsState = React.useState(readSearchOptions);
        var options = optionsState[0];
        var setOptions = optionsState[1];
        var patternState = React.useState('');
        var patternBad = patternState[0];
        var setPatternBad = patternState[1];
        var historyState = React.useState(readHistory);
        var history = historyState[0];
        var setHistory = historyState[1];
        var historyPos = React.useRef(-1);
        var rememberQuery = function (value) {
          var text = String(value === undefined || value === null ? '' : value).trim();
          if (text.length === 0) return;
          var list = readHistory().filter(function (item) { return item !== text; });
          list.unshift(text);
          if (list.length > 12) list = list.slice(0, 12);
          try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (error) { /* private mode */ }
          setHistory(list);
        };
        var inputRef = React.useRef(null);
        var listRef = React.useRef(null);
        var navRef = React.useRef([]);
        var panelRef = React.useRef(null);
        var triggerRef = React.useRef(null);
        var open = ui.isOpen();

        React.useEffect(function () {
          var stop = ui.subscribe(function () { setRevision(function (value) { return value + 1; }); });
          setRevision(function (value) { return value + 1; });
          return stop;
        }, []);

        React.useEffect(function () {
          if (!open) return undefined;
          var timer = window.setTimeout(function () {
            var queryLength = query.trim().length;
            var flags = { regex: options.regex === true, matchCase: options.matchCase === true, wholeWord: options.wholeWord === true };
            if (proseOnly) {
              var allHits = searchNodes(nodes, query, MAX_RESULTS, false, nodeCache.turns, flags);
              var allTotal = 0;
              for (var ai = 0; ai < allHits.items.length; ai += 1) allTotal += allHits.items[ai].count;
              var proseHits = dedupeHits(searchNodes(nodes, query, MAX_RESULTS, true, nodeCache.turns, flags), queryLength);
              var proseTotal = 0;
              for (var pj = 0; pj < proseHits.items.length; pj += 1) proseTotal += proseHits.items[pj].count;
              setOutside(allTotal > proseTotal ? allTotal - proseTotal : 0);
              setPatternBad(allHits.invalid === true ? String(allHits.reason || '') : '');
              setResults(proseHits);
            } else {
              var all = searchNodes(nodes, query, MAX_RESULTS, false, nodeCache.turns, flags);
              setOutside(0);
              setPatternBad(all.invalid === true ? String(all.reason || '') : '');
              setResults(dedupeHits(all, queryLength));
            }
            setActive(0);
            setFilter('');
          }, SEARCH_DEBOUNCE_MS);
          return function () { window.clearTimeout(timer); };
        }, [open, query, nodes, proseOnly, options.regex, options.matchCase, options.wholeWord]);

        React.useEffect(function () {
          if (!open) return undefined;
          var text = query.trim();
          if (text.length === 0) return undefined;
          try { window.localStorage.setItem(LAST_QUERY_KEY, text); } catch (error) { /* private mode */ }
          return undefined;
        }, [open, query]);

        React.useEffect(function () {
          if (open) return undefined;
          rememberQuery(query);
          historyPos.current = -1;
          return undefined;
        }, [open]);

        React.useEffect(function () {
          if (open) return undefined;
          clearHighlight();
          clearAllMarks();
          return undefined;
        }, [open]);

        React.useEffect(function () {
          if (!open) return undefined;
          paintAllMarks(query.trim());
          return undefined;
        }, [open, query, results]);

        React.useEffect(function () {
          if (!open) return undefined;
          var timer = window.setTimeout(function () {
            var input = inputRef.current;
            if (input !== null) { input.focus(); input.select(); }
          }, 0);
          return function () { window.clearTimeout(timer); };
        }, [open]);

        React.useEffect(function () {
          if (!open || typeof document === 'undefined') return undefined;
          var onPointerDown = function (event) {
            var target = event.target;
            var panelElement = panelRef.current;
            var triggerElement = triggerRef.current;
            if (panelElement !== null && typeof panelElement.contains === 'function' && panelElement.contains(target)) return;
            if (triggerElement !== null && typeof triggerElement.contains === 'function' && triggerElement.contains(target)) return;
            ui.setOpen(false);
          };
          document.addEventListener('pointerdown', onPointerDown, true);
          return function () { document.removeEventListener('pointerdown', onPointerDown, true); };
        }, [open]);

        React.useEffect(function () {
          if (!open) return;
          var list = listRef.current;
          if (list === null) return;
          var rows = list.querySelectorAll('[data-row="true"]');
          var row = rows.length === 0 ? undefined : rows[Math.min(active, rows.length - 1)];
          if (row === undefined || row === null) return;
          var listRect = list.getBoundingClientRect();
          var rowRect = row.getBoundingClientRect();
          if (rowRect.bottom > listRect.bottom) list.scrollTop = list.scrollTop + (rowRect.bottom - listRect.bottom) + 4;
          else if (rowRect.top < listRect.top) list.scrollTop = list.scrollTop - (listRect.top - rowRect.top) - 4;
        }, [active, open, results, roleFilterOn]);

        var goTo = function (index) {
          var items = navRef.current;
          if (items.length === 0) return;
          var next = ((index % items.length) + items.length) % items.length;
          setActive(next);
          setNotice('');
          var hit = items[next];
          var turnMax = 0;
          if (Array.isArray(nodeCache.turns) && nodeCache.turns.length > 0) {
            var lastTurn = Number(nodeCache.turns[nodeCache.turns.length - 1]);
            if (Number.isFinite(lastTurn)) turnMax = lastTurn;
          }
          var context = {
            index: hit.index,
            total: Array.isArray(nodes) ? nodes.length : 0,
            turn: hit.turn,
            turnMax: turnMax,
            nodes: nodes,
            needle: hit.match !== undefined && hit.match !== null && String(hit.match).length >= 2
              ? String(hit.match)
              : needleOf(hit.text, hit.at, Number(hit.len) > 0 ? Number(hit.len) : normalize(query).length),
            alts: Array.isArray(hit.alts) ? hit.alts : [],
            primaries: items.map(function (row) { return row.key; }),
            query: query.trim(),
            order: order
          };
          trace('jump key=' + String(hit.key) + ' kind=' + String(hit.kind) + ' turn=' + String(hit.turn) + ' idx=' + String(hit.index) + ' q=' + JSON.stringify(String(query.trim())));
          revealNode(hit.key, context).then(function (outcome) {
            paintAllMarks(query.trim());
            if (outcome === null) { setNotice(t('jumpFailed')); return; }
            if (outcome.exact === false) { setNotice(t('jumpApproximate')); return; }
            setNotice(outcome.highlighted === false ? t('jumpHidden') : '');
          });
        };

        /** F3 / Ctrl+G reach the panel through the global key handler below; it calls these. */
        ui.next = function () { goTo(activeIndex + 1); };
        ui.prev = function () { goTo(activeIndex - 1); };

        var onInputKeyDown = function (event) {
          if (event.key === 'Enter') { event.preventDefault(); goTo(activeIndex + (event.shiftKey ? -1 : 1)); return; }
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); ui.setOpen(false); return; }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (history.length === 0) return;
            var input = inputRef.current;
            if (input === null) return;
            var caret = Number(input.selectionStart);
            var caretEnd = Number(input.selectionEnd);
            if (caret !== caretEnd) return;
            if (event.key === 'ArrowUp' && caret !== 0) return;
            if (event.key === 'ArrowDown' && caret !== String(query).length) return;
            event.preventDefault();
            var step = event.key === 'ArrowUp' ? 1 : -1;
            var pos = historyPos.current < 0 ? (step > 0 ? 0 : history.length - 1) : ((historyPos.current + step) % history.length + history.length) % history.length;
            historyPos.current = pos;
            setQuery(history[pos]);
          }
        };

        var trigger = h('button', {
          ref: triggerRef,
          type: 'button', className: 'dsh-session-find-btn', title: t('open') + ' (Ctrl+F)', 'aria-label': t('open'),
          onClick: function () { ui.setOpen(!open); }
        }, h('svg', { viewBox: '0 0 16 16', width: 15, height: 15, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: '1.5' },
          h('circle', { cx: 7, cy: 7, r: 4.5 }), h('path', { d: 'M10.5 10.5 L14 14', strokeLinecap: 'round' })));

        if (!open) return h(React.Fragment, null, h('style', { key: 's' }, STYLES), trigger);

        var total = 0;
        for (var i = 0; i < results.items.length; i += 1) total += results.items[i].count;
        /** Payload-only hits (tool arguments, mirrors of an answer) never render as prose, so
         *  listing them beside the visible message reads as "one result repeated several times". */
        var proseItems = [];
        var payloadCount = 0;
        for (var pi = 0; pi < results.items.length; pi += 1) {
          var row = results.items[pi];
          if (isPayloadKind(row.kind) || looksLikeSource(row)) payloadCount += 1;
          else proseItems.push(row);
        }
        var payloadOnly = proseItems.length === 0 && payloadCount > 0;
        var shown = showPayload || payloadOnly ? results.items : proseItems;
        var hiddenPayload = shown === results.items ? 0 : payloadCount;

        /** Group the visible rows by where they came from, so the bar can show counts per
         *  source and the user can filter down to one of them. */
        var roleCounts = {};
        var rolePresent = [];
        for (var ri = 0; ri < shown.length; ri += 1) {
          var rowRole = roleOfResult(shown[ri]);
          if (roleCounts[rowRole] === undefined) { roleCounts[rowRole] = 0; rolePresent.push(rowRole); }
          roleCounts[rowRole] += 1;
        }
        var roleFilter = roleFilterOn !== '' && roleCounts[roleFilterOn] !== undefined ? roleFilterOn : '';
        var listed = roleFilter === '' ? shown : shown.filter(function (item) { return roleOfResult(item) === roleFilter; });
        navRef.current = listed;
        var activeIndex = listed.length === 0 ? 0 : Math.min(active, listed.length - 1);
        var meta = query.trim().length === 0
          ? t('empty')
          : (patternBad !== ''
            ? t('regexInvalid')
            : (results.items.length === 0
              ? t('none')
              : t('count', { n: total }) + (results.folded > 0 ? t('merged', { n: results.folded }) : '') + (payloadOnly ? t(proseOnly ? 'payloadOnlyProse' : 'payloadOnly') : '') + (results.truncated ? ' ' + t('limited', { n: MAX_RESULTS }) : '')));
        var scopeSuffix = null;
        if (proseOnly && query.trim().length > 0 && outside > 0) {
          scopeSuffix = h(React.Fragment, null, ' · ', h('button', {
            type: 'button', className: 'dsh-session-find-meta-link', title: t('scopeSwitchAll'),
            onClick: function () { setScope(false); }
          }, results.items.length === 0 ? t('scopeMiss', { n: outside }) : t('scopeExcluded', { n: outside })));
        }

        var setScope = function (next) {
          setProseOnly(next);
          setFilter('');
          setActive(0);
          try { window.localStorage.setItem(PROSE_KEY, next ? '1' : '0'); } catch (error) { /* private mode */ }
        };
        var scope = h('div', { className: 'dsh-session-find-scope' },
          h('button', {
            type: 'button', className: 'dsh-session-find-scope-btn', 'data-on': proseOnly ? 'true' : 'false',
            title: t('scopeHint'),
            onClick: function () { setScope(!proseOnly); }
          }, h('span', { className: 'dsh-session-find-scope-dot' }), t(proseOnly ? 'scopeProse' : 'scopeAll')),
          h('span', { className: 'dsh-session-find-scope-hint' }, t('scopeHint')));

        var setOption = function (name, next) {
          var merged = {
            regex: options.regex === true,
            matchCase: options.matchCase === true,
            wholeWord: options.wholeWord === true
          };
          merged[name] = next === true;
          setOptions(merged);
          setActive(0);
          setFilter('');
          try { window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(merged)); } catch (error) { /* private mode */ }
        };
        var optionChip = function (name, glyph, label, hint) {
          var on = options[name] === true;
          return h('button', {
            key: name, type: 'button', className: 'dsh-session-find-scope-btn', 'data-on': on ? 'true' : 'false',
            title: hint, 'aria-label': hint, 'aria-pressed': on ? 'true' : 'false',
            onClick: function () { setOption(name, on !== true); }
          }, h('span', { className: 'dsh-session-find-opt-glyph' }, glyph), label);
        };
        var optionsRow = h('div', { className: 'dsh-session-find-scope' },
          optionChip('regex', '.*', t('optRegex'), t('optRegexHint')),
          optionChip('matchCase', 'Aa', t('optMatchCase'), t('optMatchCaseHint')),
          optionChip('wholeWord', 'ab', t('optWholeWord'), t('optWholeWordHint')),
          h('span', {
            className: patternBad !== '' ? 'dsh-session-find-scope-hint dsh-session-find-bad' : 'dsh-session-find-scope-hint',
            title: patternBad !== '' ? patternBad : undefined
          }, patternBad !== '' ? t('regexInvalid') + ' · ' + t('regexHintBad') : t('optHint')));

        var hitLengthOf = function (item) {
          var value = Number(item.len);
          return Number.isFinite(value) && value > 0 ? value : normalize(query).length;
        };
        var exportMarkdown = function () {
          var lines = [];
          var typed = query.trim();
          lines.push('# ' + (typed.length === 0 ? t('empty') : t('exportTitle', { q: typed })));
          lines.push('');
          var bits = [proseOnly ? t('scopeProse') : t('scopeAll')];
          if (options.regex === true) bits.push(t('optRegex'));
          if (options.matchCase === true) bits.push(t('optMatchCase'));
          if (options.wholeWord === true) bits.push(t('optWholeWord'));
          bits.push(new Date().toLocaleString());
          lines.push('> ' + bits.join(' · '));
          lines.push('> ' + t('exportMeta', { n: total, rows: listed.length }));
          var lastTurn = null;
          for (var i = 0; i < listed.length; i += 1) {
            var item = listed[i];
            var turnNo = Number(item.turn);
            if (Number.isFinite(turnNo) && turnNo > 0 && turnNo !== lastTurn) {
              lastTurn = turnNo;
              lines.push('');
              lines.push('### ' + t('turn', { n: turnNo }));
              lines.push('');
            }
            var chips = '**' + roleLabel(roleOfResult(item)) + '**';
            if (Number(item.count) > 1) chips += ' · ' + t('hits', { n: Number(item.count) });
            if (Number(item.duplicates) > 0) chips += ' · ' + t('sameText', { n: Number(item.duplicates) + 1 });
            lines.push('- ' + chips + ' — ' + snippetOf(String(item.text), Number(item.at), hitLengthOf(item)));
          }
          return lines.join(LF) + LF;
        };
        var copyFallback = function (value) {
          try {
            var area = document.createElement('textarea');
            area.value = value;
            area.setAttribute('readonly', 'readonly');
            area.style.position = 'fixed';
            area.style.top = '-1000px';
            document.body.appendChild(area);
            area.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(area);
            return ok === true;
          } catch (error) { return false; }
        };
        var copyResults = function () {
          var value = exportMarkdown();
          var done = function (ok) { setNotice(ok ? t('exportCopied') : t('exportFailed')); };
          try {
            if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
              navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(copyFallback(value)); });
              return;
            }
          } catch (error) { /* fall through */ }
          done(copyFallback(value));
        };
        var downloadResults = function () {
          var value = exportMarkdown();
          var stamp = new Date();
          var pad = function (n) { return n < 10 ? '0' + String(n) : String(n); };
          var slug = query.trim().replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
          var name = 'session-find-' + (slug.length > 0 ? slug + '-' : '') + String(stamp.getFullYear()) + pad(stamp.getMonth() + 1) + pad(stamp.getDate()) + '-' + pad(stamp.getHours()) + pad(stamp.getMinutes()) + '.md';
          var fallback = function () {
            try {
              var blob = new Blob([value], { type: 'text/markdown;charset=utf-8' });
              var url = URL.createObjectURL(blob);
              var anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = name;
              anchor.style.display = 'none';
              document.body.appendChild(anchor);
              anchor.click();
              document.body.removeChild(anchor);
              window.setTimeout(function () { try { URL.revokeObjectURL(url); } catch (error) { /* ignore */ } }, 4000);
              setNotice(t('exportPrompt'));
            } catch (error) { setNotice(t('exportFailed')); }
          };
          fallback();
        };

        var filters = query.trim().length === 0 || rolePresent.length === 0 ? null : h('div', { className: 'dsh-session-find-filters' },
          h('button', {
            type: 'button', className: 'dsh-session-find-filter', 'data-on': roleFilter === '' ? 'true' : 'false',
            onClick: function () { setFilter(''); setActive(0); }
          }, t('filterAll') + ' ' + String(shown.length)),
          rolePresent.map(function (name) {
            return h('button', {
              key: name, type: 'button', className: 'dsh-session-find-filter',
              'data-on': roleFilter === name ? 'true' : 'false',
              onClick: function () { setFilter(name); setActive(0); }
            }, roleLabel(name) + ' ' + String(roleCounts[name]));
          }));

        var rows = [];
        var lastGroup = -1;
        listed.forEach(function (item, index) {
          var turnNo = Number(item.turn);
          if (Number.isFinite(turnNo) && turnNo > 0 && turnNo !== lastGroup) {
            lastGroup = turnNo;
            rows.push(h('li', { key: 'group-' + String(turnNo), className: 'dsh-session-find-group', role: 'presentation' }, t('groupTurn', { n: turnNo })));
          }
          rows.push(h('li', { key: (item.key === undefined ? String(index) : String(item.key)) + ':' + String(index), 'data-row': 'true' },
            h(HitButton, { result: item, index: index, active: index === activeIndex, query: query, onPick: goTo })));
        });

        var panel = h('div', {
          ref: panelRef, className: 'dsh-session-find-panel', role: 'dialog', 'aria-label': t('open'),
          onKeyDown: function (event) {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            if (event.target === inputRef.current) return;
            if (listed.length === 0) return;
            event.preventDefault();
            goTo(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
          }
        },
          h('div', { className: 'dsh-session-find-row' },
            h('input', {
              ref: inputRef, className: 'dsh-session-find-input', type: 'text', value: query,
              placeholder: t('placeholder'), 'aria-label': t('placeholder'),
              onChange: function (event) { historyPos.current = -1; setQuery(event.target.value); },
              onKeyDown: onInputKeyDown
            }),
            iconButton(t('prev'), h('path', { d: 'M4 10 L8 6 L12 10' }), function () { goTo(activeIndex - 1); }, listed.length === 0),
            iconButton(t('next'), h('path', { d: 'M4 6 L8 10 L12 6' }), function () { goTo(activeIndex + 1); }, listed.length === 0),
            iconButton(t('exportCopy'), h('g', null,
              h('rect', { x: 5.5, y: 5.5, width: 7, height: 7, rx: 1.5 }),
              h('path', { d: 'M3.5 10.5 V3.5 a1 1 0 0 1 1 -1 h6' })), copyResults, listed.length === 0),
            iconButton(t('exportDownload'), h('g', null,
              h('path', { d: 'M8 2.5 V9.5 M5 7 L8 10 L11 7' }),
              h('path', { d: 'M3 12.5 h10' })), downloadResults, listed.length === 0),
            iconButton(t('close'), h('path', { d: 'M4 4 L12 12 M12 4 L4 12' }), function () { ui.setOpen(false); }, false)),
          h('div', { className: 'dsh-session-find-meta' },
            h('span', null, meta, scopeSuffix),
            h('span', null, notice !== '' ? notice : t('hint'))),
          scope,
          optionsRow,
          filters,
          payloadCount === 0 || payloadOnly ? null : h('button', {
            type: 'button', className: 'dsh-session-find-more',
            onClick: function () { setPayload(!showPayload); }
          }, hiddenPayload > 0 ? t(proseOnly ? 'payloadMoreProse' : 'payloadMore', { n: hiddenPayload }) : t(proseOnly ? 'payloadHideProse' : 'payloadHide', { n: payloadCount })),
          listed.length === 0 ? null : h('ul', { ref: listRef, className: 'dsh-session-find-list' }, rows));


        return h(React.Fragment, null, h('style', { key: 's' }, STYLES), trigger, panel);
      };
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        var current = ZH;
        try {
          if (typeof navigator !== 'undefined' && String(navigator.language || '').toLowerCase().indexOf('zh') !== 0) current = EN;
        } catch (error) { /* keep ZH */ }
        var t = function (key, vars) {
          var text = current[key] !== undefined ? current[key] : key;
          if (vars !== undefined) {
            Object.keys(vars).forEach(function (name) {
              text = text.split('{' + name + '}').join(String(vars[name]));
            });
          }
          return text;
        };
        ctx.inject(['locale'], function (scoped) {
          try {
            scoped.effect(function () { return scoped.locale.register(NS, { zh: ZH, en: EN }); }, 'session-find: dictionaries');
            t = scoped.locale.bind(NS);
          } catch (error) { /* keep the local table */ }
        });

        var listeners = new Set();
        var open = false;
        var ui = {
          subscribe: function (listener) { listeners.add(listener); return function () { listeners.delete(listener); }; },
          isOpen: function () { return open; },
          next: function () {},
          prev: function () {},
          setOpen: function (next) {
            if (open === next) return;
            open = next;
            listeners.forEach(function (listener) {
              try { listener(); } catch (error) { /* one listener must not break the rest */ }
            });
          }
        };

        ctx.effect(function () {
          var onKeyDown = function (event) {
            if (event.defaultPrevented || event.isComposing) return;
            var target = event.target;
            var tag = target === null || target === undefined ? '' : String(target.tagName || '');
            var editing = target !== null && target !== undefined && (target.isContentEditable === true || /^(input|textarea)$/i.test(tag));
            if (event.key === 'Escape' && open) {
              event.preventDefault();
              event.stopPropagation();
              ui.setOpen(false);
              return;
            }
            if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && (event.key === 'f' || event.key === 'F')) {
              if (editing && open) return;
              event.preventDefault();
              event.stopPropagation();
              ui.setOpen(true);
              return;
            }
            var f3 = event.key === 'F3' || event.keyCode === 114;
            if (open && (f3 || ((event.ctrlKey || event.metaKey) && !event.altKey && (event.key === 'g' || event.key === 'G')))) {
              event.preventDefault();
              event.stopPropagation();
              if (event.shiftKey) ui.prev(); else ui.next();
            }
          };
          window.addEventListener('keydown', onKeyDown, true);
          return function () { window.removeEventListener('keydown', onKeyDown, true); };
        }, 'session-find: shortcut');

        var FindBar = makeFindBar(function (key, vars) { return t(key, vars); }, ui);
        ctx.slots.inject('conversation.session.header.utilities', function () {
          return ctx.slots.register({
            name: 'conversation.session.header.utilities',
            id: 'session-find',
            order: 60
          }, FindBar);
        });
      }
    };
  }
});
