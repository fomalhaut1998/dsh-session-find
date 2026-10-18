# dsh-session-find

[![npm](https://img.shields.io/npm/v/dsh-session-find?color=0b7285)](https://www.npmjs.com/package/dsh-session-find)
[![license](https://img.shields.io/badge/license-MIT-2f9e44)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.2.x-5b8def)](https://github.com/deepseek-ai/deepseek-harness)

DeepSeek Harness 的**会话内查找**：按 `Ctrl+F` 在当前对话里全文搜索，点结果跳到那条消息并高亮。

纯客户端插件、零依赖、不联网——所有搜索都在浏览器里完成，会话内容不出本机。

[English](README.en.md) · [更新日志](CHANGELOG.md) · [设计说明](docs/DESIGN.md)

![会话内查找面板](assets/overview.png)

## 它解决什么问题

Harness 的对话动辄几十轮、正文里混着工具调用与长 JSON，原生页内查找（Ctrl+F 开浏览器搜索框）只能命中**渲染出来的可见文字**，找不到折叠的步骤、工具参数、思考内容，也不会告诉你「这条是谁说的、第几轮」。

这个插件把查找做成对话原生的：

| 能力 | 说明 |
|---|---|
| 来源分类 | 每条命中标出来源：**你 / 助手 / 思考 / 工具调用 / 工具输出 / 系统**，可按来源过滤 |
| 轮次分组 | 结果按「第 N 轮」分组，行内也带 `第 N 轮` 标签，一眼看出上下文位置 |
| 同文合并 | 同一段文字在多处出现（比如重复的工具返回）合并成一条 `同文 ×N` |
| 正文 / 全量 | 默认只搜**正文**（你发的 + 助手回复），一键切到搜全部内容（含思考、工具参数、系统提示），并显示「已排除 N 处」 |
| 正则 · Aa · 全词 | 查 `m0\d{3}`、`session-`、`D:\\DSH` 这类 token 时用；全词只对英文/数字词生效 |
| 全量高亮 | 命中的每一处都在对话里高亮，当前选中的那条额外描边 |
| 复制 / 导出 | 一键把结果复制成 Markdown（轮次 + 来源 + 片段），或导出 `.md` 文件 |
| 记住状态 | 查询词、搜索范围、正则开关、历史记录（最近 12 条，输入框里 ↑↓ 调取）都记在 localStorage |

## 兼容性

| 项 | 值 |
|---|---|
| DSH 版本 | 0.2.x（开发与实测：`dsh-desktop-next 2.0.18-next` / `@deepseek-ai/dsh-base 0.2.1-alpha.2`） |
| 客户端 | 桌面窗口与网页端都可用 |
| 依赖 | 无运行时依赖；只注入 `@deepseek-ai/dsh-client-ui-conversation` 的 `conversation.session.header.utilities` 槽位 |
| 需要 | `dsh plugin` 子命令（DSH 自带的插件 CLI） |

槽位不存在（更早的 0.1.x）时面板不会出现；与其它同样注册该槽位、且抢占 `Ctrl+F` 的插件互斥——同一时间只会有一个面板响应快捷键。

## 安装

```sh
# 从 npm 装（--profile 省略时改默认 profile）
dsh plugin add dsh-session-find
dsh plugin --profile desktop add dsh-session-find

# 需要固定版本时
dsh plugin add dsh-session-find@1.4.0

# 或从 GitHub 装（跟踪 main）
dsh plugin add github:fomalhaut1998/dsh-session-find

# 本地开发：直接 link 一个工作副本
dsh plugin add link:/path/to/dsh-session-find
```

装完**完全退出 DSH 再启动**：客户端 bundle 在宿主启动时组装，新插件不会在运行中热加载。之后改 `client.js` 只需刷新页面（桌面端 Ctrl+R，网页端 Ctrl+Shift+R）。

卸载：`dsh plugin remove dsh-session-find`（同样支持 `--profile`）。

## 快捷键

| 按键 | 动作 |
|---|---|
| `Ctrl+F` | 打开 / 关闭查找面板（焦点在输入框时再次按下也关闭） |
| `Enter` / `Shift+Enter` | 下一个 / 上一个命中 |
| `Ctrl+G` / `F3`（`Shift` 反向） | 同上，来自编辑器习惯 |
| `↑` / `↓` | 输入框里：调取历史查询；列表里（焦点不在输入框）：逐条选结果 |
| `Esc` | 关闭面板（保留对话里的高亮，直到再次搜索） |
| `Tab` / 点击 | 在「只在正文里搜」「正则 / Aa / 全词」「来源筛选」之间移动 |

## 一个例子

```
Ctrl+F → 输入 dsh → 面板顶部：198 处匹配 · 已合并 3 条同文 · 已排除 6347 处
        点「Aa」→ 156 处匹配（只剩大小写完全一致的）
        点「只在正文里搜」→ 只保留你和助手说过的话，工具 JSON 里的命中被排除
```

数字都是实测口径：**匹配数**是全部命中（含同文重复），**列出的条数**是合并去重后能点开的行。

## 复制 / 导出的格式

```markdown
# 检索：工具

> 只在正文里搜 · 2026/10/18 14:56:48
> 45 处匹配 · 列出 1 条

### 第 4 轮

- **你** — …g 我自己的这个插件，有以下地方可以优化一下： 1、横向的长度可以长一点…
```

直接粘进笔记 / issue / 文档就能用。桌面端走系统「另存为」对话框；网页端走浏览器的普通下载。

## 实现要点

- **数据来源**：从对话 store 的 canonical `order` 逐条读节点（`nodeStore.get(key)`），而不是抓 DOM——所以折叠的步骤、未渲染的工具参数都能搜到。
- **命中投影**：每个节点把内容拆成带来源标记的片段（`role`），正文模式只拼 `user` + `assistant` 的文本；「已排除 N 处」= 全量命中数 − 正文命中数。
- **定位**：点结果时先把所在轮次/步骤展开，再按轮次二分 + 单向 `scrollTop` 收敛到目标行；key 对不上时按内容兜底，因此长会话里也是稳定的一两步滚动。
- **高亮**：CSS Custom Highlight API（`::highlight(dsh-session-find)` 与 `::highlight(dsh-session-find-all)`），不改 DOM、不打断 React 渲染。
- **零宿主依赖**：`index.js` 的 `apply()` 是空的，没有 IPC、没有后台索引、不发网络请求。
- **隐私**：localStorage 里只存查询词、搜索范围、三个开关和最近 12 条历史（`dsh-session-find:*`），不保存会话内容、没有遥测；可以在 devtools 的 Network 面板确认全程无请求。

更细的取舍、跳转算法与真机回归数据见 [docs/DESIGN.md](docs/DESIGN.md)。

## 已知限制

| 限制 | 原因 |
|---|---|
| 只搜**已加载**的历史 | 会话是按需分页加载的；未加载的旧消息不在 store 里 |
| 结果列表上限 300 条 | 面板是滚动列表，再多也没人点；匹配总数不受限 |
| 全词只对 ASCII 生效 | 中文没有词边界，"全词"对中文无意义，所以只在查询是纯英文/数字时启用 |
| 不跨会话搜索 | 需要宿主索引，属于另一个量级的功能，未做 |
| 折叠步骤里的命中 | 会跳到所在回合并提示「已跳到所在回合」 |

## 常见问题

| 现象 | 原因与处理 |
|---|---|
| 装完按 `Ctrl+F` 没反应 | 没有完全退出 DSH 再启动（bundle 只在宿主启动时组装）；托盘 / 任务栏里的残留进程也要退干净 |
| 面板能开，但搜不到很早的消息 | 只搜已加载历史；先把对话往上翻，让旧消息进 store |
| 两个面板打架、或只有一个生效 | 另一个插件也注册了同一槽位 / 抢了 `Ctrl+F`；先停用其中一个 |
| 桌面端按 `F3` 没反应 | 宿主先吃掉了这个键；用 `Ctrl+G`，走同一条路径（已验证） |
| 改了 `client.js` 但界面没变 | 客户端产物有缓存：刷新页面；改了 `cordis.patch.yml` / `package.json` 这类结构才需要完全重启 |
| 升级后偏好被重置 | 1.4.0 起 localStorage 前缀从 `@local/dsh-session-find:` 改为 `dsh-session-find:`，旧偏好不迁移（默认回到「只在正文里搜」） |

## 本地开发

```
client.js          客户端 bundle：手写 ModuleLoader 格式，无构建步骤
index.js           宿主半：空 apply（不注册工具 / 服务）
cordis.patch.yml   bundle 入口，id 与 name 都是 dsh-session-find
package.json       dsh.bundle.patch 指向上面的 patch，dsh.client.inject 声明槽位依赖
docs/DESIGN.md     设计说明与取舍
```

- **没有构建**：直接改 `client.js`，保存后刷新页面即可；改完 `cordis.patch.yml` / `package.json` 才需要完全重启。
- **模块 id 必须等于包名**：`__ModuleLoader__.load({ id: "dsh-session-find", ... })`；宿主按 bundle 名注册，id 不一致会找不到入口。
- **语法自检**（不想开界面时最快的兜底）：

  ```sh
  node -e "new (require('vm').Script)(require('fs').readFileSync('client.js','utf8'))"
  ```

- **手测清单**：打开面板 → 切正文 / 全量 → 切正则 · Aa · 全词 → 点结果跳转 → 复制、导出 → 刷新后确认查询词与开关还在。

## License

MIT
