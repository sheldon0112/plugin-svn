// CC GUI adaptation of EastChilde/dsh-svn. See LICENSE.
export default function activate(ctx) {
  const React = ctx.react
  const { useState, useEffect, useRef, useCallback, useMemo } = React
  const h = React.createElement

  const english = {
    "无法解析 SVN 的 XML 输出": "Could not parse SVN XML output",
    "请输入工作副本内的相对路径": "Enter a path relative to the working copy",
    "SVN 执行失败": "SVN command failed",
    "属性修改": "Property modified",
    "请打开本机 SVN 工作区": "Open a local SVN workspace",
    "当前工作区没有 SVN 工作副本": "This workspace is not an SVN working copy",
    "没有可对比的传入文件版本": "No incoming file revisions are available to compare",
    "请选择已提交到仓库的文件": "Select a file already committed to the repository",
    "无效的 SVN 修订号": "Invalid SVN revision",
    "无法读取改动路径，详细记录可能超过 CC GUI 的输出上限。": "Could not load changed paths. The detailed log may exceed the CC GUI output limit.",
    "找不到该修订的详细记录": "Revision details were not found",
    "无法解析 SVN 溯源输出": "Could not parse SVN blame output",
    "当前工作副本正在执行 SVN 操作": "An SVN operation is already running in this working copy",
    "请先勾选操作路径": "Select at least one path",
    "文件名不能写入忽略规则": "This filename cannot be added to an ignore rule",
    "只能忽略尚未纳入版本控制的路径": "Only unversioned paths can be ignored",
    "无法读取现有 svn:ignore 属性": "Could not read the existing svn:ignore property",
    "文件已由 ": "File is locked by ",
    " 锁定": ".",
    "当前工作副本没有此文件的有效锁": "This working copy does not hold a valid lock for the file",
    "请输入仓库相对路径，例如 ^/branches/release": "Enter a repository-relative path, such as ^/branches/release",
    "请先处理工作副本中的本地变更、未纳入文件、文件锁或已单独切换的子路径": "Resolve local changes, unversioned files, file locks, or switched child paths before switching",
    "不支持的 SVN 操作": "Unsupported SVN operation",
    "冲突": "Conflicts",
    "修改": "Modified",
    "新增": "Added",
    "删除": "Delete",
    "丢失": "Missing",
    "未纳入": "Unversioned",
    "替换": "Replaced",
    "阻塞": "Obstructed",
    "不完整": "Incomplete",
    "外部": "External",
    "忽略": "Ignored",
    "正常": "Normal",
    "未知": "Unknown",
    "关闭": "Close",
    "取消": "Cancel",
    "处理中…": "Working…",
    "确定": "Confirm",
    "差异": "Diff",
    "有未解决的冲突": "Unresolved conflicts",
    "尚未纳入版本控制": "Not under version control",
    "无可提交的变更": "No committable changes",
    "请勾选要提交的变更": "Select changes to commit",
    "提交信息不能为空": "Enter a commit message",
    "正在提交…": "Committing…",
    "已提交 r": "Committed r",
    " 个文件）": " files)",
    "更新工作副本": "Update working copy",
    "将从仓库拉取「": "Fetch the latest changes for “",
    "」的最新内容。本地未提交的修改会保留，冲突的文件会被标记出来。": "” from the repository. Local edits will be preserved and conflicting files will be marked.",
    "开始更新": "Start update",
    "正在更新…": "Updating…",
    "更新完成：r": "Updated to r",
    "，发现 ": ", found ",
    " 个冲突": " conflict(s)",
    "先勾选要还原的文件": "Select files to revert",
    "还原修改": "Revert changes",
    "将丢弃这 ": "Discard uncommitted edits in these ",
    " 个文件里未提交的本地修改，此操作不可撤销。": " files. This cannot be undone.",
    "还原": "Revert",
    "正在还原…": "Reverting…",
    "已还原 ": "Reverted ",
    " 个文件": " file(s)",
    "先勾选要删除的文件": "Select files to delete",
    "从版本库删除": "Delete from repository",
    "将删除下列 ": "Delete these ",
    " 个文件或目录。删除目录会包含其下的文件，提交后才会从仓库删除。": " files or directories. Deleting a directory includes its contents. The repository changes when you commit.",
    "正在删除…": "Deleting…",
    "已标记删除 ": "Marked for deletion: ",
    " 项": " item(s)",
    "先勾选未纳入版本控制的文件": "Select unversioned files first",
    "纳入版本控制": "Add to version control",
    "纳入下列路径后即可提交。选择目录时，也会纳入其中符合条件的子项。": "Add these paths so they can be committed. Selecting a directory also adds eligible children.",
    "纳入": "Add",
    "正在纳入…": "Adding…",
    "已纳入 ": "Added ",
    "正在解决冲突…": "Resolving conflict…",
    "加入忽略规则": "Add ignore rule",
    "将在「": "Add this name to svn:ignore in “",
    "」目录的 svn:ignore 中加入此名称。提交目录属性后会与团队共享。": "”. Commit the directory property to share the rule with your team.",
    "加入忽略": "Add rule",
    "正在写入忽略规则…": "Writing ignore rule…",
    "正在切换…": "Switching…",
    "切换完成，发现冲突": "Switched and found conflicts",
    "切换完成": "Switched successfully",
    "正在查询文件锁…": "Checking file lock…",
    "文件锁状态": "File lock status",
    "解锁文件": "Unlock file",
    "锁定文件": "Lock file",
    "仓库锁持有人：": "Repository lock owner: ",
    "锁定后，其他工作副本不能提交这个文件。": "Other working copies cannot commit the file while it is locked.",
    "解锁": "Unlock",
    "锁定": "Lock",
    "正在解锁…": "Unlocking…",
    "正在锁定…": "Locking…",
    "文件已解锁": "File unlocked",
    "文件已锁定": "File locked",
    "清理工作副本": "Clean up working copy",
    "执行 svn cleanup，清理锁和未完成的事务。工作副本被锁住或中断过操作时使用。": "Run svn cleanup to clear locks and finish interrupted operations. Use this if the working copy is locked or a command was interrupted.",
    "清理": "Clean up",
    "正在清理…": "Cleaning up…",
    "清理完成": "Cleanup complete",
    "版本控制": "Version control",
    "当前版本": "Current revision",
    "选择一个工作副本": "Select a working copy",
    "刷新": "Refresh",
    "↓ 更新": "↓ Update",
    "文件锁": "File lock",
    "切换分支／标签": "Switch branch or tag",
    "✓ 提交": "✓ Commit",
    "更改": "Changes",
    "历史": "History",
    "溯源": "Blame",
    "已对比服务器": "Compared with server",
    "本地状态": "Local status",
    " 的改动": " changes",
    "工作副本": "Working copy",
    "加载中…": "Loading…",
    "重试": "Retry",
    "请在 CC GUI 打开本机 SVN 工作区。": "Open a local SVN workspace in CC GUI.",
    "不可用": "Unavailable",
    "仓库": "Repository",
    "仓库根": "Repository root",
    "最后修改": "Last change",
    "时间": "Time",
    "清理锁": "Clean up locks",
    "查看差异": "View diff",
    "查看文件历史": "View file history",
    "逐行溯源": "Line-by-line blame",
    "提交所选": "Commit selected",
    "打开冲突工作台": "Open conflict workbench",
    "查询文件锁": "Check file lock",
    "从版本控制删除": "Schedule deletion",
    "全部 ": "All ",
    "属性被修改的文件数": "Number of files with modified properties",
    "· 属性 ": " · Properties ",
    "过滤路径…": "Filter paths…",
    "svn status -u：对比服务器上的新版本": "svn status -u: compare with the latest server revisions",
    "✓ 已对比服务器": "✓ Compared with server",
    "对比服务器": "Compare with server",
    "读取工作副本状态…": "Reading working copy status…",
    "没有符合筛选条件的文件": "No files match the filters",
    "工作副本没有本地更改": "The working copy has no local changes",
    "试试切换上方的状态筛选或清空过滤。": "Try another status filter or clear the path filter.",
    "可以点右上角「更新」拉取最新版本。": "Click Update in the top right to fetch the latest revision.",
    "\n最后提交：r": "\nLast commit: r",
    "属性有修改": "Properties modified",
    "锁：": "Lock: ",
    "远端：": "Remote: ",
    "属性冲突": "Property conflict",
    "树冲突": "Tree conflict",
    "复制": "Copy",
    "逐行溯源（blame）": "Line-by-line blame",
    "溯": "Blame",
    "刷新中…": "Refreshing…",
    "SVN 文件操作": "SVN file actions",
    "已选 ": "Selected ",
    " 项，其中 ": " item(s), including ",
    " 项当前不可见": " currently hidden",
    "全选": "Select all",
    "反选": "Invert selection",
    "解决冲突": "Resolve conflicts",
    "作者": "Author",
    "关键词（提交信息 / 作者）": "Keyword (message or author)",
    "限定路径": "Limit to path",
    "起始日期": "Start date",
    "结束日期": "End date",
    "查询": "Search",
    "重置": "Reset",
    "读取提交历史…": "Reading commit history…",
    "没有匹配的提交记录": "No matching commits",
    "试试放宽作者 / 关键词 / 日期，或清空「限定路径」。": "Broaden the author, keyword, or date filters, or clear the path filter.",
    "(无提交信息)": "(no commit message)",
    "(无作者)": "(no author)",
    "加载更早的提交": "Load older commits",
    "选择左侧的一条提交记录": "Select a commit on the left",
    "查看提交信息、改动文件与版本差异": "View the commit message, changed files, and diff",
    "复制版本号": "Copy revision number",
    "复制版本": "Copy revision",
    "查看此版本差异": "View revision diff",
    "正在读取改动路径…": "Reading changed paths…",
    "改动文件 ": "Changed files ",
    "查看该文件在此版本中的差异": "View this file’s diff in the selected revision",
    "复制自 ": "Copied from ",
    "查看该版本中此文件的逐行溯源": "View this file’s blame in the selected revision",
    "这个版本没有记录改动路径。": "No changed paths are recorded for this revision.",
    "提示：点文件看该版本中的差异；「溯」按该版本溯源。": "Select a file to view its diff, or choose Blame to inspect this revision line by line.",
    "← 返回": "← Back",
    "计算差异…": "Computing diff…",
    "已截断": "Truncated",
    "查看该文件的逐行溯源": "View this file line by line",
    "复制差异": "Copy diff",
    "换行": "Wrap",
    "文件被标记为二进制，文本差异无法显示。": "The file is marked as binary. A text diff is unavailable.",
    "该路径不在当前工作副本内，显示的是整个版本的差异。": "This path is outside the working copy. The diff shows the entire revision.",
    "该文件未纳入版本控制，下面按「新增」展示工作副本内容。": "This file is unversioned. Its working copy contents are shown as additions.",
    "没有差异": "No differences",
    "工作副本与版本库在这一范围里内容一致。": "The working copy and repository match for this range.",
    "差异共 ": "Diff contains ",
    " 行，仅显示前 ": " lines; showing the first ",
    " 行；完整内容可复制。": ". Copy to get the full diff.",
    "逐行溯源…": "Reading blame…",
    "该文件按仓库版本溯源，不含本地未提交的改动": "Blame shows the repository version without uncommitted local edits.",
    "仓库版本": "Repository version",
    " 行": " lines",
    "查看 r": "View r",
    " 的差异": " diff",
    "本地未提交的改动": "Uncommitted local changes",
    "共 ": "Total: ",
    " 行。": " lines.",
    "操作路径（": "Target paths (",
    "，其中 ": ", including ",
    "提交 ": "Commit ",
    "提交": "Commit",
    " 项已排除": " excluded",
    "提交信息（必填）…  Ctrl+Enter 提交": "Commit message (required)… Ctrl+Enter to commit",
    "提交信息以 UTF-8 写入仓库；失败或超时后请核对工作副本及提交历史。": "Commit messages use UTF-8. After failure or timeout, verify working-copy status and repository history.",
    "切换": "Switch",
    "当前：": "Current: ",
    "目标仓库路径": "Target repository path",
    "文件相对工作副本根目录的路径": "File path relative to the working copy root",
    "^/branches/release 或 ^/tags/v1.0": "^/branches/release or ^/tags/v1.0",
    "切换前请提交或还原本地变更。": "Commit or revert local changes before switching.",
    "冲突路径 ": "Conflicted path ",
    "正在读取冲突…": "Reading conflicts…",
    "没有未解决的冲突": "No unresolved conflicts",
    "内容冲突": "Text conflict",
    "解决方式": "Resolution",
    "选择解决方式": "Choose a resolution",
    "已手工处理，保留当前状态": "Resolved manually; keep the current state",
    "覆盖为冲突前的本地版本": "Replace with local version before the conflict",
    "覆盖为传入版本": "Replace with incoming version",
    "确认解决": "Confirm resolution",
    "请先在工作副本中处理文件或目录的结构冲突，再确认解决。": "Resolve the file or directory structure conflict in the working copy before confirming.",
    "查看差异中的冲突标记。保留当前状态前，请先手工移除冲突标记。": "Check the diff for conflict markers. Remove them before keeping the current state.",
    "查看工作副本差异": "View working copy diff",
    "查看传入改动": "View incoming changes",
    " · 传入改动": " · Incoming changes",
    " · 工作副本与 BASE": " · Working copy vs. BASE",
    "正在读取工作区…": "Reading workspaces…",
    "请先在 CC GUI 添加本机 SVN 工作区。": "Add a local SVN workspace in CC GUI first.",
    "读取工作区失败：": "Could not read workspaces: ",
    "工作区": "Workspace",
    "SVN 管理面板": "SVN Manager",
  }
  Object.assign(english, {
  "SVN 合并不支持工作副本路径包含 @，请使用不含 @ 的工作副本": "SVN merge does not support @ in the working-copy path. Use another working copy without @.",
  "命令超时，操作可能已部分完成；请刷新状态。提交请先核对历史，勿直接重试。": "Command timed out and may have partly completed. Refresh status; verify commit history before retrying.",
  "认证失败：请在终端对同一工作副本完成 SVN 登录，再重试。": "Authentication failed. Authenticate with SVN in a terminal for this working copy, then retry.",
  "证书验证失败：请核实服务器证书及本机 SVN 信任配置；不要关闭证书校验。": "Certificate validation failed. Verify the certificate and local SVN trust settings; keep validation enabled.",
  "连接失败：请检查网络及本机 SVN servers 文件中的代理配置。": "Connection failed. Check the network and proxy settings in the local SVN servers file.",
  "无法启动 SVN：请检查宿主可执行文件搜索路径及 exec:svn 授权。": "Cannot start SVN. Check the host executable search path and exec:svn permission.",
  "SVN 输出达到宿主 64 KiB 上限，内容可能不完整；请缩小查询范围。写操作请刷新并核对实际结果。": "SVN output reached the host 64 KiB limit and may be incomplete. Narrow the query; verify actual results after writes.",
  "成功": "Succeeded",
  "请输入不含凭据的 SVN 仓库 URL": "Enter an SVN repository URL without embedded credentials",
  "请输入本机绝对目录": "Enter an absolute local directory",
  "修订必须为 HEAD 或非负整数": "Revision must be HEAD or a nonnegative integer",
  "检出成功，但登记工作区失败；请手工添加此目录。": "Checkout succeeded but workspace registration failed. Add this directory manually. ",
  "请输入有效的仓库相对路径": "Enter a valid repository-relative path",
  "连接成功；认证与代理由本机 SVN 配置处理。更新、切换忽略 externals。": "Connected. Authentication and proxy use local SVN settings. Update and switch ignore externals.",
  "属性名称无效": "Invalid property name",
  "请输入修订范围，例如 10:12": "Enter a revision range, such as 10:12",
  "合并前请提交或还原本地变更": "Commit or revert local changes before merging",
  "请填写有效修订和提交说明": "Enter a valid revision and commit message",
  "目标分支／标签已存在，请使用新路径": "The target branch or tag already exists. Use a new path.",
  "s（读取最多 60s，写入最多 300s）": "s (reads: 60s maximum, writes: 300s maximum)",
  "更多 SVN 操作": "More SVN operations",
  "显示忽略项": "Show ignored items",
  "检出": "Checkout",
  "仓库 URL": "Repository URL",
  "本机绝对目标目录": "Absolute local destination directory",
  "修订（HEAD 或数字）": "Revision (HEAD or number)",
  "连接诊断": "Connection diagnostics",
  "合并": "Merge",
  "来源仓库路径（^/branches/name）": "Source repository path (^/branches/name)",
  "修订范围（如 10:12）": "Revision range (such as 10:12)",
  "创建分支／标签": "Create branch or tag",
  "来源仓库路径": "Source repository path",
  "目标仓库路径": "Destination repository path",
  "来源修订": "Source revision",
  "提交说明": "Commit message",
  "读取属性": "Read properties",
  "工作副本相对路径": "Working-copy-relative path",
  "设置属性／忽略规则": "Set property or ignore rules",
  "属性名（忽略规则用 svn:ignore）": "Property name (svn:ignore for ignore rules)",
  "完整属性值（将替换原值；每行一条忽略规则）": "Full property value (replaces the existing value; one ignore pattern per line)",
  "删除属性": "Delete property",
  "属性名": "Property name",
  "操作记录": "Operation history",
  "（编码：": " (encoding: ",
  "，请勿作为文本覆盖）": "; do not overwrite as text)",
  "无属性": "No properties",
  "检出并登记成功，关闭后可选择新工作区。": "Checked out and registered. Close this dialog to select the new workspace.",
  "操作完成，请核对状态；有冲突时进入冲突工作台。": "Completed. Verify status and open the conflict workbench if needed.",
  "SVN 操作": "SVN operations",
  "执行中（读取最多 60 秒，写入最多 300 秒）…": "Running (reads: up to 60s, writes: up to 300s)…",
  "SVN 操作类型": "SVN operation type",
  "仅预演（不修改工作副本）；正式合并前请先预演": "Dry run only (does not modify the working copy); preview before merging",
  "请先读取属性。设置会替换该属性的完整值；修改后需要提交。继承属性不在此处编辑。": "Read properties first. Setting a property replaces its full value and needs a commit. Inherited properties are not edited here.",
  "复用本机 SVN 凭据和 servers 代理配置，不读取密码；连接失败请在终端对同一工作副本执行 svn info。": "Uses local SVN credentials and servers proxy settings without reading passwords. If connection fails, run svn info for this working copy in a terminal.",
  "目标请使用新目录；SVN 失败可能留下部分工作副本，请核对后再重试。不会自动删除目标内容。": "Use a new directory. Failed checkout may leave a partial working copy; verify before retrying. Existing content is never automatically removed.",
  "当前插件会话最近 100 次命令，不记录参数、提交说明或凭据。": "Last 100 commands in this plugin session. Arguments, commit messages and credentials are not recorded.",
  "ms 退出码：": "ms exit code: ",
  "未返回": "unavailable",
  "复制脱敏操作记录": "Copy redacted operation history",
  "复制失败，请手动选择文本复制": "Copy failed. Select and copy the text manually.",
  "检出工作副本": "Checkout working copy"
})
  ctx.i18n.addBundle('en', 'ccgui-svn', english)
  ctx.i18n.addBundle('zh-CN', 'ccgui-svn', Object.fromEntries(Object.keys(english).map((label) => [label, label])))

  function t(label) {
    return /^en(?:-|$)/i.test(ctx.host?.locale || '') ? english[label] ?? label : label
  }

  ctx.theme.injectCss(`
.svn-root { font: inherit; color: CanvasText; --svn-accent: #4d6bfe; --svn-line: rgba(127,127,127,.22); --svn-soft: rgba(127,127,127,.08); --svn-hover: rgba(127,127,127,.13); --svn-muted: rgba(127,127,127,.95); }
.dark .svn-root { --svn-accent: #a3b6ff; --svn-muted: #b2bdcd; --svn-line: rgba(181,195,216,.25); --svn-soft: rgba(181,195,216,.09); --svn-hover: rgba(181,195,216,.16); }
.dark .svn-root .svn-btn.primary:not(:disabled) { background: #375bb5; border-color: #5278d6; }
.dark .svn-root .svn-btn.primary:hover:not(:disabled) { background: #466bce; }
.dark .svn-root .svn-btn.danger,
.dark .svn-root .svn-tag,
.dark .svn-root .svn-errorbox { color: #ffadaf; }
.dark .svn-root .svn-prop { color: #dbb7ff; }
.dark .svn-root .svn-dline.add .svn-dtext { color: #90d9aa; }
.dark .svn-root .svn-dline.del .svn-dtext { color: #ffadaf; }
.dark .svn-root .svn-dline.hunk .svn-dtext { color: var(--svn-accent); }
.svn-root *, .svn-root *::before, .svn-root *::after { box-sizing: border-box; }
.svn-root button { font: inherit; color: inherit; }
.svn-file-menu { position: fixed; z-index: 1000; display: grid; gap: 3px; padding: 5px; width: 172px; max-height: calc(100vh - 16px); overflow: auto; background: Canvas; border: 1px solid var(--svn-line); border-radius: 8px; box-shadow: 0 5px 18px #0003; }
.svn-file-menu .svn-btn { justify-content: flex-start; border-color: transparent; }
.svn-center { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.svn-workspace-picker { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid var(--svn-line); }
.svn-workspace-picker select { max-width: 100%; }
.svn-shell { flex: 1; min-height: 0; background: Canvas; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.svn-head { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--svn-line); flex: none; }
.svn-logo { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#4d6bfe,#7a5cf0); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; letter-spacing: .04em; flex: none; box-shadow: 0 3px 10px rgba(77,107,254,.35); }
.svn-headmain { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.svn-title { font-size: 14px; font-weight: 650; display: flex; align-items: center; gap: 8px; }
.svn-sub { font-size: 11.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 520px; }
.svn-revpill { font-size: 10.5px; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: rgba(77,107,254,.13); color: var(--svn-accent); border: 1px solid rgba(77,107,254,.25); }
.svn-head-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; flex: none; }
.svn-busy { font-size: 11.5px; color: var(--svn-muted); display: inline-flex; align-items: center; gap: 6px; margin-right: 4px; }
.svn-spin { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(127,127,127,.3); border-top-color: var(--svn-accent); display: inline-block; animation: svnspin .8s linear infinite; }
@keyframes svnspin { to { transform: rotate(360deg); } }
.svn-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 8px; border: 1px solid var(--svn-line); background: transparent; cursor: pointer; font-size: 12px; white-space: nowrap; transition: background .12s, border-color .12s; }
.svn-btn:hover:not(:disabled) { background: var(--svn-hover); }
.svn-btn:disabled { opacity: .45; cursor: default; }
.svn-btn.primary { background: var(--svn-accent); border-color: var(--svn-accent); color: #fff; font-weight: 600; }
.svn-btn.primary:hover:not(:disabled) { background: #3f5bea; }
.svn-btn.primary:disabled { background: var(--svn-soft); border-color: var(--svn-line); color: var(--svn-muted); opacity: 1; }
.svn-btn.danger { color: #e5484d; border-color: rgba(229,72,77,.4); }
.svn-btn.danger:hover:not(:disabled) { background: rgba(229,72,77,.12); }
.svn-btn.small { padding: 3px 8px; font-size: 11.5px; border-radius: 6px; }
.svn-icon { width: 28px; height: 28px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: grid; place-items: center; font-size: 16px; color: var(--svn-muted); }
.svn-icon:hover { background: var(--svn-hover); color: inherit; }
.svn-body { flex: 1; display: flex; min-height: 0; }
.svn-side { width: 236px; flex: none; border-right: 1px solid var(--svn-line); overflow: auto; padding: 10px; display: flex; flex-direction: column; gap: 12px; }
.svn-side-title { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--svn-muted); font-weight: 650; display: flex; align-items: center; justify-content: space-between; }
.svn-wc { display: flex; flex-direction: column; gap: 2px; padding: 7px 8px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; background: none; text-align: left; width: 100%; }
.svn-wc:hover { background: var(--svn-hover); }
.svn-wc.on { border-color: rgba(77,107,254,.45); background: rgba(77,107,254,.09); }
.svn-wc-name { font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.svn-wc-path { font-size: 10.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: rtl; text-align: left; }
.svn-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: #2f9e68; }
.svn-dot.bad { background: #e5484d; }
.svn-kv { display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; }
.svn-kv-row { display: flex; gap: 6px; min-width: 0; }
.svn-kv-k { color: var(--svn-muted); flex: none; width: 58px; }
.svn-kv-v { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.svn-side-empty { font-size: 11.5px; color: var(--svn-muted); line-height: 1.6; }
.svn-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.svn-tabs { display: flex; align-items: center; gap: 2px; padding: 0 12px; border-bottom: 1px solid var(--svn-line); flex: none; height: 38px; }
.svn-tab { height: 100%; padding: 0 10px; border: none; background: none; cursor: pointer; color: var(--svn-muted); font-size: 12.5px; border-bottom: 2px solid transparent; display: inline-flex; align-items: center; gap: 6px; }
.svn-tab:hover { color: inherit; }
.svn-tab.on { color: var(--svn-accent); border-bottom-color: var(--svn-accent); font-weight: 600; }
.svn-tab .svn-count { font-size: 10.5px; padding: 0 5px; border-radius: 999px; background: var(--svn-soft); color: var(--svn-muted); }
.svn-tab.on .svn-count { background: rgba(77,107,254,.15); color: var(--svn-accent); }
.svn-tabsep { flex: 1; }
.svn-view { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.svn-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex-wrap: wrap; flex: none; }
.svn-input { border: 1px solid var(--svn-line); border-radius: 7px; background: transparent; color: inherit; font: inherit; font-size: 12px; padding: 4px 8px; min-width: 0; }
.svn-input:focus { outline: 1px solid var(--svn-accent); outline-offset: -1px; border-color: var(--svn-accent); }
.svn-input.grow { flex: 1; }
.svn-input.sm { width: 92px; }
.svn-input.md { width: 128px; }
.svn-chip { border: 1px solid var(--svn-line); background: transparent; border-radius: 999px; padding: 2px 9px; font-size: 11px; cursor: pointer; color: var(--svn-muted); display: inline-flex; align-items: center; gap: 4px; }
.svn-chip:hover { background: var(--svn-hover); }
.svn-chip.on { border-color: var(--svn-accent); color: var(--svn-accent); background: rgba(77,107,254,.1); }
.svn-chip b { font-weight: 650; font-variant-numeric: tabular-nums; }
.svn-chips { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex: none; }
.svn-list { flex: 1; overflow: auto; min-height: 0; }
.svn-row { display: flex; align-items: center; gap: 8px; padding: 5px 12px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; min-width: 0; }
.svn-row:hover { background: var(--svn-hover); }
.svn-row.sel { background: rgba(77,107,254,.08); }
.svn-row.conflict { background: rgba(229,72,77,.06); }
.svn-row input[type=checkbox] { width: 13px; height: 13px; accent-color: var(--svn-accent); flex: none; cursor: pointer; }
.svn-badge { width: 20px; height: 20px; border-radius: 5px; display: grid; place-items: center; font-size: 11px; font-weight: 700; flex: none; font-family: ui-monospace, Consolas, monospace; }
.svn-path { flex: 1; min-width: 0; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-path .svn-dir { color: var(--svn-muted); }
.svn-prop { font-size: 9px; font-weight: 700; color: #8e4ec6; border: 1px solid rgba(142,78,198,.4); border-radius: 3px; padding: 0 3px; margin-left: 5px; vertical-align: 1px; }
.svn-tag { font-size: 9.5px; padding: 1px 5px; border-radius: 4px; background: rgba(229,72,77,.16); color: #e5484d; flex: none; }
.svn-footer { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-top: 1px solid var(--svn-line); flex-wrap: wrap; flex: none; background: var(--svn-soft); }
.svn-footer-gap { flex: 1; }
.svn-muted { color: var(--svn-muted); font-size: 11.5px; }
.svn-history { display: flex; flex: 1; min-height: 0; }
.svn-log { width: 55%; border-right: 1px solid var(--svn-line); display: flex; flex-direction: column; min-width: 0; }
.svn-log-list { flex: 1; overflow: auto; min-height: 0; }
.svn-logrow { display: flex; gap: 9px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; align-items: flex-start; }
.svn-logrow:hover { background: var(--svn-hover); }
.svn-logrow.sel { background: rgba(77,107,254,.09); }
.svn-rev { font-family: ui-monospace, Consolas, monospace; font-size: 11px; font-weight: 700; color: var(--svn-accent); background: rgba(77,107,254,.1); border-radius: 5px; padding: 2px 5px; flex: none; margin-top: 1px; }
.svn-logmain { min-width: 0; flex: 1; }
.svn-logmsg { font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-logmeta { font-size: 10.5px; color: var(--svn-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-logmore { padding: 8px 12px; border-top: 1px solid var(--svn-soft); }
.svn-detail { flex: 1; overflow: auto; padding: 14px 16px; min-width: 0; }
.svn-detail-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--svn-muted); font-size: 12px; text-align: center; line-height: 1.7; }
.svn-detail-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.svn-detail-author { font-size: 12px; font-weight: 600; }
.svn-detail-date { font-size: 11px; color: var(--svn-muted); }
.svn-msg { font-size: 12.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; background: var(--svn-soft); border: 1px solid var(--svn-soft); border-radius: 9px; padding: 9px 11px; margin: 0 0 12px; max-height: 220px; overflow: auto; }
.svn-section { font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--svn-muted); font-weight: 650; margin: 10px 0 6px; display: flex; align-items: center; gap: 6px; }
.svn-pathlist { display: flex; flex-direction: column; border: 1px solid var(--svn-soft); border-radius: 9px; overflow: hidden; }
.svn-pathrow { display: flex; align-items: center; gap: 7px; padding: 5px 8px; cursor: pointer; border-bottom: 1px solid var(--svn-soft); min-width: 0; }
.svn-pathrow:last-child { border-bottom: none; }
.svn-pathrow:hover { background: var(--svn-hover); }
.svn-pathrow .svn-path { font-size: 11.5px; }
.svn-action { width: 17px; height: 17px; border-radius: 4px; display: grid; place-items: center; font-size: 9.5px; font-weight: 700; font-family: ui-monospace, Consolas, monospace; flex: none; }
.svn-diff { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.svn-diff-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--svn-soft); flex: none; flex-wrap: wrap; }
.svn-diff-title { font-size: 12.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.svn-stat { font-size: 11px; font-family: ui-monospace, Consolas, monospace; }
.svn-stat.add { color: #2f9e68; }
.svn-stat.del { color: #e5484d; }
.svn-diff-body { flex: 1; overflow: auto; min-height: 0; background: rgba(127,127,127,.025); }
.svn-diff-body table { border-collapse: collapse; width: 100%; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 12px; line-height: 1.55; }
.svn-dline { display: flex; min-width: max-content; }
.svn-dno { width: 44px; flex: none; text-align: right; padding-right: 9px; color: var(--svn-muted); opacity: .55; user-select: none; font-size: 10.5px; }
.svn-dtext { white-space: pre; padding-right: 28px; flex: 1; }
.svn-diff-body.wrap .svn-dtext { white-space: pre-wrap; word-break: break-word; }
.svn-dline.add { background: rgba(46,160,67,.14); }
.svn-dline.add .svn-dtext { color: #1f7a4d; }
.svn-dline.del { background: rgba(248,81,73,.12); }
.svn-dline.del .svn-dtext { color: #b3383c; }
.svn-dline.hunk { background: rgba(77,107,254,.1); }
.svn-dline.hunk .svn-dtext { color: #4d6bfe; font-weight: 600; }
.svn-dline.meta .svn-dtext { color: var(--svn-muted); }
.svn-dline.meta { background: var(--svn-soft); }
.svn-blame { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.svn-blame-body { flex: 1; overflow: auto; min-height: 0; }
.svn-blame-row { display: flex; gap: 8px; padding: 1px 10px; font-family: ui-monospace, Consolas, monospace; font-size: 11.5px; line-height: 1.6; }
.svn-blame-row:hover { background: var(--svn-hover); }
.svn-blame-no { width: 40px; text-align: right; color: var(--svn-muted); opacity: .6; flex: none; }
.svn-blame-rev { width: 46px; text-align: right; color: var(--svn-accent); flex: none; cursor: pointer; }
.svn-blame-author { width: 76px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--svn-muted); flex: none; }
.svn-blame-text { white-space: pre; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.svn-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--svn-muted); font-size: 12.5px; padding: 30px; text-align: center; }
.svn-empty-icon { font-size: 30px; opacity: .5; }
.svn-errorbox { margin: 10px 12px; padding: 8px 10px; border-radius: 8px; background: rgba(229,72,77,.1); border: 1px solid rgba(229,72,77,.28); color: #c53b3f; font-size: 12px; display: flex; align-items: center; gap: 8px; }
.svn-errorbox .svn-btn { margin-left: auto; }
.svn-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--svn-muted); font-size: 12px; }
.svn-toast { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 20; max-width: 82%; padding: 7px 14px; border-radius: 999px; font-size: 12px; background: rgba(24,26,32,.94); color: #fff; box-shadow: 0 8px 28px rgba(0,0,0,.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-toast.err { background: rgba(190,50,55,.96); }
.svn-toast.warn { background: rgba(168,112,20,.97); }
.svn-modal-back { position: fixed; inset: 0; z-index: 10001; background: rgba(8,10,16,.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
.svn-modal { background: Canvas; color: CanvasText; border: 1px solid var(--svn-line); border-radius: 12px; box-shadow: 0 24px 70px rgba(0,0,0,.4); max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; max-width: 94vw; }
.svn-modal-head { display: flex; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--svn-line); flex: none; }
.svn-modal-title { font-size: 13px; font-weight: 650; }
.svn-modal-head .svn-icon { margin-left: auto; }
.svn-modal-body { padding: 14px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
.svn-modal-foot { padding: 10px 14px; border-top: 1px solid var(--svn-line); display: flex; justify-content: flex-end; gap: 8px; flex: none; }
.svn-textarea { width: 100%; min-height: 110px; resize: vertical; border: 1px solid var(--svn-line); border-radius: 9px; background: transparent; color: inherit; font: inherit; font-size: 12.5px; line-height: 1.6; padding: 8px 10px; }
.svn-textarea:focus { outline: 1px solid var(--svn-accent); outline-offset: -1px; }
.svn-commit-list { max-height: 200px; overflow: auto; border: 1px solid var(--svn-soft); border-radius: 9px; }
.svn-hint { font-size: 11px; color: var(--svn-muted); line-height: 1.55; }
.svn-candidate { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid var(--svn-soft); border-radius: 8px; }
.svn-candidate .svn-path { font-size: 11px; }
.svn-picker { display: flex; flex-direction: column; gap: 8px; height: min(62vh, 540px); min-height: 0; }
.svn-picker-path { display: flex; gap: 6px; align-items: center; }
.svn-picker-roots { display: flex; gap: 6px; flex-wrap: wrap; }
.svn-picker-root { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--svn-line); background: transparent; border-radius: 7px; padding: 3px 9px; font-size: 11.5px; color: var(--svn-muted); cursor: pointer; }
.svn-picker-root:hover { background: var(--svn-hover); color: CanvasText; }
.svn-picker-tools { display: flex; gap: 8px; align-items: center; }
.svn-picker-filter { flex: 1; min-width: 0; }
.svn-picker-toggle { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--svn-muted); white-space: nowrap; cursor: pointer; user-select: none; }
.svn-picker-toggle input { accent-color: var(--svn-accent); }
.svn-picker-list { flex: 1; min-height: 0; overflow: auto; border: 1px solid var(--svn-line); border-radius: 10px; background: Canvas; }
.svn-picker-row { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-bottom: 1px solid var(--svn-soft); cursor: pointer; min-width: 0; }
.svn-picker-row:last-child { border-bottom: none; }
.svn-picker-row:hover { background: var(--svn-hover); }
.svn-picker-row.is-wc { background: rgba(48,164,108,.05); }
.svn-folder-glyph { flex: none; }
.svn-picker-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.svn-picker-name { font-size: 12.5px; font-weight: 550; color: CanvasText; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-picker-sub { font-size: 10.5px; color: var(--svn-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.svn-picker-wc { font-size: 9.5px; padding: 1px 6px; border-radius: 999px; background: rgba(48,164,108,.16); color: #2f9e68; font-weight: 600; flex: none; }
.svn-picker-chevron { color: var(--svn-muted); font-size: 15px; line-height: 1; flex: none; opacity: .7; }
.svn-picker-empty { padding: 36px 10px; text-align: center; color: var(--svn-muted); font-size: 12px; }
.svn-picker-status { font-size: 11.5px; color: var(--svn-muted); }
.svn-picker-status.ok { color: #2f9e68; }
.svn-picker-foot { display: flex; align-items: center; gap: 8px; width: 100%; }
.svn-modal-head .svn-icon { background: transparent !important; border: none; }
.svn-hbtn { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; border-radius: 7px; border: 1px solid var(--svn-line); background: transparent; cursor: pointer; font-size: 11.5px; color: inherit; }
.svn-hbtn:hover { background: var(--svn-hover); }
.svn-hbtn-dot { width: 6px; height: 6px; border-radius: 50%; background: #4d6bfe; }
.svn-tabtitle { display: inline-flex; align-items: center; gap: 5px; }
.svn-tabtitle i { width: 6px; height: 6px; border-radius: 50%; background: #4d6bfe; }
.svn-pane { padding: 10px 12px 16px; display: flex; flex-direction: column; gap: 9px; min-height: 100%; }
.svn-pane-head { display: flex; align-items: center; gap: 7px; }
.svn-pane-title { font-size: 13px; font-weight: 650; display: flex; align-items: center; gap: 6px; }
.svn-pane-actions { margin-left: auto; display: flex; gap: 2px; }
.svn-pane-wc { width: 100%; border: 1px solid var(--svn-line); border-radius: 7px; background: transparent; color: inherit; font-size: 11.5px; padding: 4px 6px; }
.svn-pane-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.svn-pane-file { display: flex; align-items: center; gap: 6px; padding: 3px 2px; cursor: pointer; border-radius: 5px; min-width: 0; }
.svn-pane-file:hover { background: var(--svn-hover); }
.svn-pane-file .svn-path { font-size: 11px; }
.svn-pane-logrow { display: flex; gap: 6px; align-items: baseline; padding: 2px 2px; cursor: pointer; border-radius: 5px; min-width: 0; }
.svn-pane-logrow:hover { background: var(--svn-hover); }
.svn-pane-logmsg { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.svn-pane-logmeta { font-size: 10px; color: var(--svn-muted); flex: none; }
.svn-pane-empty { font-size: 11.5px; color: var(--svn-muted); line-height: 1.65; }
.svn-center { container-type: inline-size; }
@media (max-width: 860px) { .svn-body, .svn-history { flex-direction: column; overflow: auto; } .svn-side, .svn-log, .svn-detail { display: block; width: 100%; min-height: 180px; flex: none; } .svn-head { flex-wrap: wrap; } .svn-headmain { flex: 1; } .svn-head-actions { margin-left: 0; width: 100%; flex-wrap: wrap; } }
@container (max-width: 860px) { .svn-body, .svn-history { flex-direction: column; overflow: auto; } .svn-side, .svn-log, .svn-detail { display: block; width: 100%; min-height: 180px; flex: none; } .svn-head { flex-wrap: wrap; } .svn-headmain { flex: 1; } .svn-head-actions { margin-left: 0; width: 100%; flex-wrap: wrap; } }
`)

  const writes = new Set()

  function parseXml(source) {
    const doc = new DOMParser().parseFromString(source, 'application/xml')
    if (doc.querySelector('parsererror')) throw new SyntaxError(t('无法解析 SVN 的 XML 输出'))
    return doc
  }

  function field(node, selector) {
    return node?.querySelector(selector)?.textContent || ''
  }

  function target(path, revision = '') {
    return path + '@' + revision
  }

  function isAbsolute(path) { return /^(?:\/|[a-z]:[\\/]|\\\\)/i.test(path) }

  function isWindowsPath(path) { return /^(?:[a-z]:|\\\\|\/\/[^/])/i.test(path) }

  function normalizedPath(path) {
    const value = isWindowsPath(path) ? path.replace(/\\/g, '/') : path
    return value.replace(/\/+$/, '')
  }

  function pathKey(path) {
    const value = normalizedPath(path)
    return isWindowsPath(path) ? value.toLowerCase() : value
  }

  function relativePath(root, path) {
    const base = normalizedPath(root)
    const value = normalizedPath(path)
    const key = pathKey(root)
    const candidate = pathKey(path)
    if (candidate === key) return '.'
    return candidate.startsWith(key + '/') ? value.slice(base.length + 1) : null
  }

  function localPath(root, rel = '') {
    const windows = isWindowsPath(root)
    const value = windows ? rel.replace(/\\/g, '/') : rel
    if (isAbsolute(value) || /^[a-z]:/i.test(value) || value.split('/').includes('..') || /\0/.test(value) ||
        (windows && value.split('/').some((part) => part !== '.' && (/[<>:"|?*\x00-\x1f]/.test(part) || /[ .]$/.test(part) || /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part))))) {
      throw new Error(t('请输入工作副本内的相对路径'))
    }
    return value && value !== '.' ? normalizedPath(root) + '/' + value : root
  }

  const operations = []
  const operationListeners = new Set()
  function redact(value) {
    return String(value).replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/]+/gi, '$1[仓库]')
      .replace(/((?:password|passwd|token|secret|authorization)\s*[:=]\s*)\S+/gi, '$1[已隐藏]')
  }
  function diagnose(error) {
    const message = String(error?.message || error)
    const hint = /timed out|timeout/i.test(message) ? t("命令超时，操作可能已部分完成；请刷新状态。提交请先核对历史，勿直接重试。")
      : /E170001|E215004|authentication|authorization failed/i.test(message) ? t("认证失败：请在终端对同一工作副本完成 SVN 登录，再重试。")
      : /certificate|E230001/i.test(message) ? t("证书验证失败：请核实服务器证书及本机 SVN 信任配置；不要关闭证书校验。")
      : /proxy|E170013|E670002|could not resolve|connection refused/i.test(message) ? t("连接失败：请检查网络及本机 SVN servers 文件中的代理配置。")
      : /failed to start|ENOENT/i.test(message) ? t("无法启动 SVN：请检查宿主可执行文件搜索路径及 exec:svn 授权。") : ''
    return redact(message + (hint ? '\n' + hint : ''))
  }

  async function svn(command, args, targets) {
    const started = Date.now()
    const writing = ['update', 'commit', 'revert', 'delete', 'add', 'resolve', 'cleanup', 'propset', 'propdel', 'lock', 'unlock', 'switch', 'checkout', 'merge', 'copy'].includes(command)
    const record = { command, started, code: null }
    try {
      const result = await ctx.bridge.invoke('plugin_exec_run', {
        bin: 'svn', args: [command, '--non-interactive', ...args, '--', ...targets],
        env: { LC_ALL: 'en_US.UTF-8' }, timeoutMs: writing ? 300000 : 60000,
      })
      record.code = result.code
      if ([result.stdout, result.stderr].some((text) => new TextEncoder().encode(text).length >= 65530)) {
        throw new Error(t("SVN 输出达到宿主 64 KiB 上限，内容可能不完整；请缩小查询范围。写操作请刷新并核对实际结果。"))
      }
      if (result.code !== 0) throw new Error(result.stderr.trim() || t('SVN 执行失败'))
      record.detail = result.stderr ? redact(result.stderr) : t("成功")
      return result.stdout
    } catch (error) {
      record.detail = diagnose(error)
      throw new Error(record.detail)
    } finally {
      record.elapsed = Date.now() - started
      operations.unshift(record)
      operations.splice(100)
      for (const listener of operationListeners) listener()
    }
  }

  function countConflicts(output) {
    return Array.from(output.matchAll(/(?:Text|Property|Tree) conflicts: (\d+)/gi), (match) => Number(match[1]))
      .reduce((sum, count) => sum + count, 0)
  }

  function diffResult(diff, relPath, revision, synthesized = false) {
    return {
      diff,
      synthesized,
      relPath,
      revision,
      empty: !diff,
      binary: /Cannot display: file marked as a binary type/.test(diff),
      additions: (diff.match(/^\+(?!\+\+)/gm) || []).length,
      deletions: (diff.match(/^-(?!--)/gm) || []).length,
    }
  }

  function hasConflict(entry) {
    return entry.item === 'conflicted' || entry.props === 'conflicted' || entry.treeConflicted
  }

  function hasLocalChange(entry) {
    return entry.item !== 'normal' || entry.props === 'modified' || hasConflict(entry)
  }

  function canCommit(entry) {
    return !hasConflict(entry) && (Object.hasOwn(COMMIT_ITEMS, entry.item) || (entry.item === 'normal' && entry.props === 'modified'))
  }

  function displayStatus(entry) {
    return hasConflict(entry) ? 'conflicted' : entry.item
  }

  function remoteStatusLabel(status) {
    if (!status) return ''
    const item = status.item && !['none', 'normal'].includes(status.item) ? t(metaOf(status.item).label) : ''
    const props = status.props === 'modified' ? t('属性修改') : ''
    return [item, props].filter(Boolean).join('、')
  }

  function makeApi(workspacePath) {
    let info
    return async function api(route, options = {}) {
      if (route === '/state') {
        if (!workspacePath || !isAbsolute(workspacePath)) throw new Error(t('请打开本机 SVN 工作区'))
        const doc = parseXml(await svn('info', ['--xml'], [target(workspacePath)]))
        const entry = doc.querySelector('entry')
        const path = field(entry, 'wc-info > wcroot-abspath')
        if (!path) throw new Error(t('当前工作区没有 SVN 工作副本'))
        // wcroot-abspath uses the client's own path form; keep the registered path when both denote the same directory.
        const root = pathKey(path) === pathKey(workspacePath) ? workspacePath : path
        info = {
          path: root,
          name: normalizedPath(root).split('/').pop() || root,
          revision: Number(entry.getAttribute('revision')),
          url: field(entry, 'url'),
          root: field(entry, 'repository > root'),
          relativeUrl: field(entry, 'relative-url'),
          lastChangedRev: Number(entry.querySelector('commit')?.getAttribute('revision')),
          lastChangedAuthor: field(entry, 'commit > author'),
          lastChangedDate: field(entry, 'commit > date'),
        }
        // The active workspace can be nested or switched. Use its URL for the WC root.
        if (pathKey(path) !== pathKey(workspacePath)) {
          const rootEntry = parseXml(await svn('info', ['--xml'], [target(path)])).querySelector('entry')
          info.url = field(rootEntry, 'url')
          info.relativeUrl = field(rootEntry, 'relative-url')
          info.revision = Number(rootEntry.getAttribute('revision'))
          info.lastChangedRev = Number(rootEntry.querySelector('commit')?.getAttribute('revision'))
          info.lastChangedAuthor = field(rootEntry, 'commit > author')
          info.lastChangedDate = field(rootEntry, 'commit > date')
        }
        return { workingCopies: [info] }
      }

      if (route === '/checkout') {
        const url = new URL(options.url)
        if (!['file:', 'http:', 'https:', 'svn:', 'svn+ssh:'].includes(url.protocol) || url.username || url.password) throw new Error(t("请输入不含凭据的 SVN 仓库 URL"))
        if (!isAbsolute(options.directory) || /[\r\n]/.test(options.directory)) throw new Error(t("请输入本机绝对目录"))
        const revision = options.revision || 'HEAD'
        if (!/^(?:HEAD|\d+)$/.test(revision)) throw new Error(t("修订必须为 HEAD 或非负整数"))
        if (writes.has(pathKey(options.directory))) throw new Error(t('当前工作副本正在执行 SVN 操作'))
        writes.add(pathKey(options.directory))
        try {
          const directoryTarget = isWindowsPath(options.directory) ? normalizedPath(options.directory) + '/' : options.directory
          await svn('checkout', ['-r', revision, '--ignore-externals'], [target(url.href, revision), directoryTarget])
          try { await ctx.workspaces.add(options.directory) } catch (error) {
            throw new Error(t("检出成功，但登记工作区失败；请手工添加此目录。") + diagnose(error))
          }
          return { directory: options.directory }
        } finally { writes.delete(pathKey(options.directory)) }
      }

      const root = options.wc
      const repoTarget = options.path?.startsWith('/')
      const path = repoTarget ? options.path.split('/').map(encodeURIComponent).join('/') : ''
      const rel = options.path || ''
      const revision = Number(options.revision)
      const validRevision = Number.isSafeInteger(revision) && revision > 0
      const location = repoTarget ? info.root.replace(/\/$/, '') + path : localPath(root, rel)

      function repositoryUrl(value = '') {
        const segments = value.slice(2).split('/')
        if (!value.startsWith('^/') || segments.some((part) => !part || part === '.' || part === '..')) throw new Error(t("请输入有效的仓库相对路径"))
        return info.root.replace(/\/$/, '') + '/' + segments.map(encodeURIComponent).join('/')
      }

      if (route === '/properties') {
        const doc = parseXml(await svn('proplist', ['--xml', '-v'], [target(location)]))
        return Array.from(doc.querySelectorAll('property'), (node) => ({ name: node.getAttribute('name'), value: node.textContent, encoding: node.getAttribute('encoding') }))
      }
      if (route === '/diagnose') {
        await svn('info', ['--xml', '-r', 'HEAD'], [target(info.url, 'HEAD')])
        return { output: t("连接成功；认证与代理由本机 SVN 配置处理。更新、切换忽略 externals。") }
      }

      if (route === '/conflict' || route === '/conflict-incoming') {
        const doc = parseXml(await svn('info', ['--xml'], [target(location)]))
        const nodes = Array.from(doc.querySelectorAll('conflict, tree-conflict'))
        if (route === '/conflict-incoming') {
          const node = nodes.find((item) => item.getAttribute('type') === 'text')
          const sources = ['source-left', 'source-right'].map((side) =>
            node?.querySelector('version[side="' + side + '"]'))
          if (!sources.every((source) => source?.getAttribute('kind') === 'file')) {
            throw new Error(t('没有可对比的传入文件版本'))
          }
          const [left, right] = sources.map((source) => target(
            source.getAttribute('repos-url').replace(/\/$/, '') + '/' +
              source.getAttribute('path-in-repos').split('/').map(encodeURIComponent).join('/'),
            source.getAttribute('revision'),
          ))
          return diffResult(await svn('diff', ['--internal-diff', '--old', left, '--new', right], []), rel)
        }
        return nodes.map((node) => ({
          operation: node.getAttribute('operation'),
          reason: node.getAttribute('reason'),
          action: node.getAttribute('action'),
          versions: Array.from(node.querySelectorAll('version'), (version) =>
            version.getAttribute('side') + ' · ' + version.getAttribute('path-in-repos') + '@' + version.getAttribute('revision')),
        }))
      }

      if (route === '/lock-info') {
        const entry = parseXml(await svn('info', ['--xml'], [target(location)])).querySelector('entry')
        if (entry?.getAttribute('kind') !== 'file' || field(entry, 'wc-info > schedule') !== 'normal') {
          throw new Error(t('请选择已提交到仓库的文件'))
        }
        const url = field(entry, 'url')
        const remote = parseXml(await svn('info', ['--xml', '-r', 'HEAD'], [target(url, 'HEAD')]))
        const owner = field(remote, 'lock > owner')
        const token = field(entry, 'lock > token')
        return { owner, canUnlock: !!token && token === field(remote, 'lock > token') }
      }

      if (route === '/status') {
        const args = ['--xml', '--ignore-externals']
        if (options.ignored) args.push('--no-ignore')
        if (options.remote) args.push('--show-updates')
        const doc = parseXml(await svn('status', args, [target(root)]))
        const entries = Array.from(doc.querySelectorAll('entry')).flatMap((entry) => {
          const wc = entry.querySelector('wc-status')
          const commit = wc?.querySelector('commit')
          const repos = entry.querySelector('repos-status')
          const raw = entry.getAttribute('path')
          const relative = raw && relativePath(root, raw)
          if (!wc || relative == null) return []
          return [{
            path: relative,
            item: wc.getAttribute('item'),
            props: wc.getAttribute('props'),
            switched: wc.getAttribute('switched') === 'true',
            copied: wc.getAttribute('copied') === 'true',
            commit: commit && { revision: Number(commit.getAttribute('revision')), author: field(commit, 'author') },
            treeConflicted: wc.getAttribute('tree-conflicted') === 'true',
            lockOwner: field(repos, 'lock > owner') || field(wc, 'lock > owner'),
            reposStatus: repos && { item: repos.getAttribute('item'), props: repos.getAttribute('props') },
          }]
        })
        const summary = { total: 0, props: 0 }
        for (const entry of entries) {
          if (entry.props === 'modified') summary.props++
          if (hasLocalChange(entry)) summary.total++
          const item = displayStatus(entry)
          summary[item] = (summary[item] || 0) + 1
        }
        return { entries, summary }
      }

      if (route === '/log') {
        if (Number(info.revision) === 0 && !options.path) {
          const head = parseXml(await svn('info', ['--xml', '-r', 'HEAD'], [target(info.url, 'HEAD')]))
          if (head.querySelector('entry')?.getAttribute('revision') === '0') return { entries: [], hasMore: false }
        }
        const limit = 20
        const before = options.beforeRev ? options.beforeRev - 1 : 'HEAD'
        const historyLocation = repoTarget || !rel ? (repoTarget ? location : info.url)
          : info.url.replace(/\/$/, '') + '/' + rel.split('/').map(encodeURIComponent).join('/')
        const doc = parseXml(await svn('log', ['--xml', '-l', String(limit), '-r', before + ':1'], [target(historyLocation, 'HEAD')]))
        const page = Array.from(doc.querySelectorAll('logentry'), (entry) => ({
          revision: Number(entry.getAttribute('revision')),
          author: field(entry, 'author'),
          date: field(entry, 'date'),
          message: field(entry, 'msg'),
        }))
        const author = options.author?.trim().toLowerCase() || ''
        const keyword = options.keyword?.trim().toLowerCase() || ''
        const entries = page.filter((entry) => {
          const date = entry.date.slice(0, 10)
          return entry.author.toLowerCase().includes(author)
            && (!options.from || date >= options.from)
            && (!options.to || date <= options.to)
            && [entry.message, entry.author]
              .some((value) => value.toLowerCase().includes(keyword))
        })
        const nextBefore = page.at(-1)?.revision
        return { entries, nextBefore, hasMore: page.length === limit && nextBefore > 1 }
      }

      if (route === '/log-detail') {
        if (!validRevision) throw new Error(t('无效的 SVN 修订号'))
        let doc
        try {
          const xml = await svn('log', ['--xml', '-v', '-r', String(revision)], [target(info.url, 'HEAD')])
          doc = parseXml(xml)
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new Error(t('无法读取改动路径，详细记录可能超过 CC GUI 的输出上限。'))
          }
          throw error
        }
        const entry = doc.querySelector('logentry')
        if (!entry) throw new Error(t('找不到该修订的详细记录'))
        return {
          paths: Array.from(entry.querySelectorAll('paths > path'), (item) => ({
            action: item.getAttribute('action'),
            kind: item.getAttribute('kind'),
            path: item.textContent,
            copyFrom: item.getAttribute('copyfrom-path'),
            copyFromRev: Number(item.getAttribute('copyfrom-rev')),
          })),
        }
      }

      if (route === '/diff') {
        const args = ['--internal-diff']
        let destinations = [location]
        if (validRevision) {
          if (repoTarget) {
            args.push('-r', (revision - 1) + ':' + revision, '--old', info.root)
            destinations = [rel.slice(1)]
          } else {
            args.push('-c', String(revision))
            destinations = [target(info.url, revision)]
          }
        }
        const synthesized = !validRevision && options.unversioned === true
        if (synthesized) {
          args.push('--old', isWindowsPath(root) ? 'NUL' : '/dev/null', '--new', target(location))
          destinations = []
        }
        const diff = await svn('diff', args, destinations)
        return diffResult(diff, rel, validRevision ? revision : undefined, synthesized)
      }

      if (route === '/blame') {
        const end = validRevision ? String(revision) : (repoTarget ? 'HEAD' : 'BASE')
        const output = await svn('blame', ['-r', '1:' + end], [target(location, end)])
        const rows = output.replace(/\r?\n$/, '').split(/\r?\n/).filter(Boolean)
        const lines = rows.slice(0, 5000).map((row, index) => {
          const match = /^\s*(\d+|-)\s+(\S+) (.*)$/.exec(row)
          if (!match) throw new Error(t('无法解析 SVN 溯源输出'))
          return { line: index + 1, revision: Number(match[1]) || 0, author: match[2], text: match[3] }
        })
        return { lines, total: rows.length, remote: true, truncated: rows.length > lines.length }
      }

      if (writes.has(pathKey(root))) throw new Error(t('当前工作副本正在执行 SVN 操作'))
      const paths = options.paths?.map((item) => localPath(root, item)) || []
      const targets = paths.map((item) => target(item))
      const scoped = ['/commit', '/revert', '/delete', '/add', '/resolve'].includes(route)
      if (scoped && !targets.length) throw new Error(t('请先勾选操作路径'))
      const modes = ['working', 'base', 'mine-full', 'theirs-full', 'mine-conflict', 'theirs-conflict']
      const commands = {
        '/update': ['update', ['--accept', 'postpone', '--ignore-externals'], [target(root)]],
        '/commit': ['commit', ['--depth', 'empty', '-m', options.message || ''], targets],
        '/revert': ['revert', ['--depth', 'empty'], targets],
        '/delete': ['delete', [], targets],
        '/add': ['add', ['--parents'], targets],
        '/resolve': ['resolve', ['--accept', modes.includes(options.accept) ? options.accept : 'working'], targets],
        '/cleanup': ['cleanup', [], [root]],
      }
      const command = commands[route]
      writes.add(pathKey(root))
      try {
        if (route === '/property-set' || route === '/property-delete') {
          if (!/^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(options.name || '')) throw new Error(t("属性名称无效"))
          await svn(route === '/property-set' ? 'propset' : 'propdel', [], route === '/property-set'
            ? [options.name, options.value || '', target(location)] : [options.name, target(location)])
          return {}
        }
        if (route === '/merge') {
          if (root.includes('@')) throw new Error(t("SVN 合并不支持工作副本路径包含 @，请使用不含 @ 的工作副本"))
          if (!/^[0-9]+:[0-9]+$/.test(options.range || '')) throw new Error(t("请输入修订范围，例如 10:12"))
          if (options.dryRun !== true) {
            const status = await api('/status', { wc: root })
            if (status.entries.some(hasLocalChange)) throw new Error(t("合并前请提交或还原本地变更"))
          }
          const source = repositoryUrl(options.source)
          const args = ['-r', options.range, '--accept', 'postpone']
          if (options.dryRun === true) args.push('--dry-run')
          const output = await svn('merge', args, [target(source, 'HEAD'), root])
          return { output, conflicts: countConflicts(output) }
        }
        if (route === '/copy') {
          const revision = options.revision || 'HEAD'
          if (!/^(?:HEAD|\d+)$/.test(revision) || !options.message?.trim()) throw new Error(t("请填写有效修订和提交说明"))
          const destination = repositoryUrl(options.destination)
          const parent = destination.slice(0, destination.lastIndexOf('/'))
          const name = decodeURIComponent(destination.slice(destination.lastIndexOf('/') + 1))
          const listing = parseXml(await svn('list', ['--xml'], [target(parent, 'HEAD')]))
          if (Array.from(listing.querySelectorAll('entry > name')).some((node) => node.textContent === name)) throw new Error(t("目标分支／标签已存在，请使用新路径"))
          const output = await svn('copy', ['-r', revision, '-m', options.message],
            [target(repositoryUrl(options.source), revision), target(repositoryUrl(options.destination))])
          return { output }
        }
        if (route === '/ignore') {
          const name = rel.split('/').at(-1)
          const parent = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '.'
          const parentTarget = target(localPath(root, parent))
          if (!name || name === '.' || /[\r\n]/.test(name)) throw new Error(t('文件名不能写入忽略规则'))
          const status = parseXml(await svn('status', ['--xml', '--depth', 'empty'], [target(location)]))
          if (status.querySelector('wc-status')?.getAttribute('item') !== 'unversioned') {
            throw new Error(t('只能忽略尚未纳入版本控制的路径'))
          }
          const props = parseXml(await svn('proplist', ['--xml', '-v'], [parentTarget]))
          const property = props.querySelector('property[name="svn:ignore"]')
          if (property?.hasAttribute('encoding')) throw new Error(t('无法读取现有 svn:ignore 属性'))
          const previous = (property?.textContent || '').replace(/\r\n?/g, '\n')
          const pattern = name.replace(/[*?\[\\]/g, (character) => '\\' + character)
          if (!previous.split(/\r?\n/).includes(pattern)) {
            const separator = previous && !previous.endsWith('\n') ? '\n' : ''
            await svn('propset', [], ['svn:ignore', previous + separator + pattern + '\n', parentTarget])
          }
          return {}
        }
        if (route === '/lock' || route === '/unlock') {
          const lock = await api('/lock-info', { wc: root, path: rel })
          if (route === '/lock' && lock.owner) throw new Error(t('文件已由 ') + lock.owner + t(' 锁定'))
          if (route === '/unlock' && !lock.canUnlock) throw new Error(t('当前工作副本没有此文件的有效锁'))
          await svn(route.slice(1), [], [target(location)])
          return {}
        }
        if (route === '/switch') {
          const destination = options.destination.trim()
          const segments = destination.slice(2).split('/')
          if (!destination.startsWith('^/') || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
            throw new Error(t('请输入仓库相对路径，例如 ^/branches/release'))
          }
          const status = await api('/status', { wc: root })
          if (status.entries.some((entry) => hasLocalChange(entry) || entry.switched || entry.lockOwner)) {
            throw new Error(t('请先处理工作副本中的本地变更、未纳入文件、文件锁或已单独切换的子路径'))
          }
          const url = info.root.replace(/\/$/, '') + '/' + segments.map(encodeURIComponent).join('/')
          const output = await svn('switch', ['--ignore-externals', '--accept', 'postpone'], [target(url, 'HEAD'), root])
          return { conflicts: countConflicts(output) }
        }
        if (!command) throw new Error(t('不支持的 SVN 操作'))
        const output = await svn(...command)
        return {
          output,
          revision: Number(/(?:Committed|Updated to|At) revision (\d+)/i.exec(output)?.[1]) || null,
          conflicts: countConflicts(output),
        }
      } finally {
        writes.delete(pathKey(root))
      }
    }
  }

  const COMMIT_ITEMS = { modified: 1, added: 1, deleted: 1, replaced: 1 }

  const STATUS_META = {
    conflicted: { letter: 'C', label: '冲突', color: '#e5484d', bg: 'rgba(229,72,77,.16)' },
    modified: { letter: 'M', label: '修改', color: '#c98421', bg: 'rgba(217,144,42,.16)' },
    added: { letter: 'A', label: '新增', color: '#2f9e68', bg: 'rgba(48,164,108,.16)' },
    deleted: { letter: 'D', label: '删除', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    missing: { letter: '!', label: '丢失', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    unversioned: { letter: '?', label: '未纳入', color: '#8b93a7', bg: 'rgba(139,147,167,.16)' },
    replaced: { letter: 'R', label: '替换', color: '#8e4ec6', bg: 'rgba(142,78,198,.16)' },
    obstructed: { letter: '~', label: '阻塞', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    incomplete: { letter: '!', label: '不完整', color: '#e5484d', bg: 'rgba(229,72,77,.14)' },
    external: { letter: 'X', label: '外部', color: '#8b93a7', bg: 'rgba(139,147,167,.16)' },
    ignored: { letter: 'I', label: '忽略', color: '#8b93a7', bg: 'rgba(139,147,167,.14)' },
    normal: { letter: ' ', label: '正常', color: '#8b93a7', bg: 'rgba(139,147,167,.14)' },
  }

  function metaOf(item) {
    return STATUS_META[item] || { letter: '?', label: item || t('未知'), color: '#8b93a7', bg: 'rgba(139,147,167,.16)' }
  }

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function fmtDate(iso, withTime) {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return String(iso).slice(0, 16).replace('T', ' ')
    const head = date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
    return withTime === false ? head : head + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes())
  }

  function firstLine(message, max) {
    const line = String(message || '').split(/\r?\n/)[0].trim()
    const limit = max || 200
    return line.length > limit ? line.slice(0, limit) + '…' : line
  }

  function splitPath(rel) {
    const value = String(rel || '').replace(/\\/g, '/')
    const index = value.lastIndexOf('/')
    if (index < 0) return ['', value]
    return [value.slice(0, index + 1), value.slice(index + 1)]
  }

  async function copyText(value) {
    const text = String(value || '')
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { return await navigator.clipboard.writeText(text) } catch (error) {}
    }
    return fallbackCopy(text)
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea')
    try {
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      if (!document.execCommand('copy')) throw new Error(t('复制失败，请手动选择文本复制'))
    } finally {
      area.remove()
    }
  }

  function CopyButton({ text, children, ...props }) {
    const [failed, setFailed] = useState(false)
    return h(React.Fragment, null,
      h('button', { ...props, onClick: async () => {
        setFailed(false)
        try { await copyText(text) } catch (error) { setFailed(true) }
      } }, children),
      failed ? h('span', { className: 'svn-tag', role: 'alert' }, t('复制失败，请手动选择文本复制')) : null,
    )
  }

  function parseDiff(text) {
    const lines = []
    let oldNo = 0
    let newNo = 0
    for (const raw of String(text || '').split(/\r?\n/)) {
      if (raw.startsWith('@@')) {
        const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw)
        if (match) {
          oldNo = Number(match[1]) || 0
          newNo = Number(match[2]) || 0
        }
        lines.push({ type: 'hunk', text: raw })
        continue
      }
      if (raw.startsWith('+++') || raw.startsWith('---')) {
        lines.push({ type: 'meta', text: raw })
        continue
      }
      if (/^(Index:|={5,}|Property changes on:|Added:|Modified:|Deleted:|## )/.test(raw)) {
        lines.push({ type: 'meta', text: raw })
        continue
      }
      if (raw.startsWith('+')) {
        lines.push({ type: 'add', text: raw, newNo })
        newNo += 1
        continue
      }
      if (raw.startsWith('-')) {
        lines.push({ type: 'del', text: raw, oldNo })
        oldNo += 1
        continue
      }
      if (raw.startsWith(' ')) {
        lines.push({ type: 'ctx', text: raw, oldNo, newNo })
        oldNo += 1
        newNo += 1
        continue
      }
      lines.push({ type: 'meta', text: raw })
    }
    return lines
  }

  function actionMeta(action) {
    if (action === 'A') return { bg: 'rgba(48,164,108,.16)', color: '#2f9e68' }
    if (action === 'D') return { bg: 'rgba(229,72,77,.14)', color: '#e5484d' }
    if (action === 'R') return { bg: 'rgba(142,78,198,.16)', color: '#8e4ec6' }
    return { bg: 'rgba(217,144,42,.16)', color: '#c98421' }
  }

  function Spinner() {
    return h('span', { className: 'svn-spin' })
  }

  function StatusBadge(props) {
    const meta = metaOf(props.item)
    return h('span', {
      className: 'svn-badge',
      style: { background: meta.bg, color: meta.color },
      title: t(meta.label),
    }, meta.letter)
  }

  function Empty(props) {
    return h('div', { className: 'svn-empty' },
      h('div', { className: 'svn-empty-icon' }, props.icon || '⌗'),
      h('div', null, props.title),
      props.hint ? h('div', { style: { fontSize: 11.5, opacity: .8 } }, props.hint) : null,
      props.action || null,
    )
  }

  function Modal(props) {
    useEffect(() => {
      const onKey = (event) => {
        if (event.key === 'Escape') {
          event.stopImmediatePropagation()
          props.onClose()
        }
      }
      window.addEventListener('keydown', onKey, true)
      return () => window.removeEventListener('keydown', onKey, true)
    }, [props.onClose])

    return h('div', {
      className: 'svn-root svn-modal-back',
      onMouseDown: (event) => { if (event.target === event.currentTarget) props.onClose() },
    }, h('div', { className: 'svn-modal', style: { width: props.width || 460 } },
      h('div', { className: 'svn-modal-head' },
        h('div', { className: 'svn-modal-title' }, props.title),
        h('button', { type: 'button', className: 'svn-icon', title: t('关闭'), onClick: props.onClose }, '×'),
      ),
      h('div', { className: 'svn-modal-body' }, props.children),
      props.footer ? h('div', { className: 'svn-modal-foot' }, props.footer) : null,
    ))
  }

  function ConfirmDialog(props) {
    const [working, setWorking] = useState(false)
    const [error, setError] = useState('')

    async function confirm() {
      setWorking(true)
      setError('')
      try {
        const ok = props.onOk ? await props.onOk() : true
        if (ok !== false) props.onClose()
      } catch (err) {
        setError(String((err && err.message) || err))
      } finally {
        setWorking(false)
      }
    }

    return h(Modal, {
      title: props.title,
      width: 460,
      onClose: working ? () => {} : props.onClose,
      footer: h(React.Fragment, null,
        h('button', { type: 'button', className: 'svn-btn', onClick: props.onClose, disabled: working }, t('取消')),
        h('button', {
          type: 'button',
          className: 'svn-btn ' + (props.danger ? 'danger' : 'primary'),
          onClick: confirm,
          disabled: working,
        }, working ? t('处理中…') : (props.okLabel || t('确定'))),
      ),
    },
      h('div', { style: { fontSize: 12.5, lineHeight: 1.75 } }, props.body),
      props.targets ? h(TargetPaths, props.targets) : null,
      props.detail ? h('pre', { className: 'svn-msg', style: { margin: 0, maxHeight: 160, fontSize: 11.5 } }, props.detail) : null,
      error ? h('div', { className: 'svn-errorbox', style: { margin: 0 } }, error) : null,
    )
  }

  //#endregion

  // 组件实现（继续保持在一个 factory 里，便于宿主加载）
  //#region 主面板

  function SvnApp(props) {
    const [stateData, setStateData] = useState(null)
    const [stateLoading, setStateLoading] = useState(true)
    const [stateError, setStateError] = useState('')
    const api = props.api
    const [status, setStatus] = useState(null)
    const [statusLoading, setStatusLoading] = useState(false)
    const [statusError, setStatusError] = useState('')
    const [log, setLog] = useState(null)
    const [logLoading, setLogLoading] = useState(false)
    const [logError, setLogError] = useState('')
    const [filters, setFilters] = useState({ author: '', keyword: '', path: '', from: '', to: '' })
    const [filterDraft, setFilterDraft] = useState({ author: '', keyword: '', path: '', from: '', to: '' })
    const [tab, setTab] = useState('changes')
    const [returnTab, setReturnTab] = useState('changes')
    const [detail, setDetail] = useState(null)
    const [selected, setSelected] = useState(() => Object.create(null))
    const [itemFilter, setItemFilter] = useState('all')
    const [pathFilter, setPathFilter] = useState('')
    const [remote, setRemote] = useState(false)
    const [ignored, setIgnored] = useState(false)
    const [advanced, setAdvanced] = useState(false)
    const [diff, setDiff] = useState(null)
    const [blame, setBlame] = useState(null)
    const [busy, setBusy] = useState('')
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
      setElapsed(0)
      if (!busy) return
      const start = Date.now()
      const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
      return () => clearInterval(timer)
    }, [busy])
    const [toast, setToast] = useState(null)
    const [confirm, setConfirm] = useState(null)
    const [commitSelection, setCommitSelection] = useState(null)
    const commitPaths = commitSelection?.paths || []
    const [commitMessage, setCommitMessage] = useState('')
    const [conflictPath, setConflictPath] = useState('')
    const [pathAction, setPathAction] = useState(null)

    const toastTimer = useRef(null)
    const statusSeq = useRef(0)
    const logSeq = useRef(0)
    const previewSeq = useRef(0)

    function notify(message, kind) {
      setToast({ message: String(message), kind: kind || 'ok' })
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 4200)
    }

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

    const current = stateData?.workingCopies[0]
    const currentPath = current?.path || ''
    useEffect(() => () => { previewSeq.current++ }, [currentPath])

    const loadState = useCallback(async (silent) => {
      if (!silent) setStateLoading(true)
      try {
        const data = await api('/state')
        setStateData(data)
        setStateError('')
        return data
      } catch (err) {
        setStateError(String((err && err.message) || err))
        return null
      } finally {
        if (!silent) setStateLoading(false)
      }
    }, [])

    useEffect(() => {
      void loadState()
    }, [loadState])

    const loadStatus = useCallback(async (options) => {
      if (!currentPath) return
      const seq = statusSeq.current + 1
      statusSeq.current = seq
      setStatusLoading(true)
      setStatusError('')
      try {
        const data = await api('/status', { wc: currentPath, remote: !!(options && options.remote), ignored })
        if (seq !== statusSeq.current) return
        setStatus(data)
        setSelected((prev) => {
          const next = Object.create(null)
          for (const entry of data.entries) if (prev[entry.path]) next[entry.path] = true
          return next
        })
      } catch (err) {
        if (seq === statusSeq.current) setStatusError(String((err && err.message) || err))
      } finally {
        if (seq === statusSeq.current) setStatusLoading(false)
      }
    }, [currentPath, ignored])

    const loadLog = useCallback(async (options) => {
      if (!currentPath) return
      const opts = options || {}
      const useFilters = opts.filters || filters
      const seq = logSeq.current + 1
      logSeq.current = seq
      setLogLoading(true)
      setLogError('')
      try {
        const data = await api('/log', {
          wc: currentPath,
          beforeRev: opts.beforeRev,
          author: useFilters.author,
          keyword: useFilters.keyword,
          path: useFilters.path,
          from: useFilters.from,
          to: useFilters.to,
        })
        if (seq !== logSeq.current) return
        setLog((prev) => {
          if (opts.append && prev) return Object.assign({}, data, { entries: prev.entries.concat(data.entries) })
          return data
        })
        if (opts.filters) setFilters(opts.filters)
      } catch (err) {
        if (seq === logSeq.current) setLogError(String((err && err.message) || err))
      } finally {
        if (seq === logSeq.current) setLogLoading(false)
      }
    }, [currentPath, filters])

    useEffect(() => {
      setStatus(null)
      setLog(null)
      setDetail(null)
      setDiff(null)
      setBlame(null)
      setSelected(Object.create(null))
      setTab((prev) => (prev === 'diff' || prev === 'blame' ? 'changes' : prev))
      setStatusError('')
      setLogError('')
      if (currentPath) {
        loadStatus({ remote: remote })
        loadLog({ filters: filters })
      }
    }, [currentPath])

    useEffect(() => { if (currentPath) loadStatus({ remote }) }, [ignored])

    async function perform(label, fn) {
      setBusy(label)
      try {
        return await fn()
      } catch (err) {
        notify(diagnose(err), 'err')
        await refreshAll()
        return null
      } finally {
        setBusy('')
      }
    }

    async function refreshAll(nextFilters = filters) {
      await loadState(true)
      await Promise.all([loadStatus({ remote: remote }), loadLog({ filters: nextFilters })])
    }

    async function loadDetail(entry) {
      const request = { ...entry, loading: true }
      setDetail(request)
      try {
        const data = await api('/log-detail', { wc: currentPath, revision: entry.revision })
        setDetail((current) => current === request ? { ...entry, paths: data.paths } : current)
      } catch (error) {
        setDetail((current) => current === request ? { ...entry, error: error.message } : current)
      }
    }

    function openPreview(tabName, route, request, args, setPreview) {
      const seq = ++previewSeq.current
      setReturnTab(tab === 'diff' || tab === 'blame' ? returnTab : tab)
      setTab(tabName)
      setPreview({ ...request, loading: true })
      api(route, { wc: currentPath, ...args }).then(
        (data) => { if (seq === previewSeq.current) setPreview({ ...request, data }) },
        (error) => { if (seq === previewSeq.current) setPreview({ ...request, error: error.message || String(error) }) },
      )
    }

    function openDiff(options) {
      openPreview('diff', '/diff', { title: options.title || t('差异') }, options.body, setDiff)
    }

    function openBlame(pathValue, label, revision) {
      openPreview('blame', '/blame', { path: pathValue, label: label || pathValue },
        { path: pathValue, revision }, setBlame)
    }

    const entries = (status && status.entries) || []
    const keyword = pathFilter.trim().toLowerCase()
    const visible = entries.filter((entry) =>
      (itemFilter === 'all' || displayStatus(entry) === itemFilter) && entry.path.toLowerCase().includes(keyword))
    const visiblePaths = new Set(visible.map((entry) => entry.path))
    const conflicts = entries.filter(hasConflict)
    const selectedEntries = entries.filter((entry) => selected[entry.path])
    function countHidden(paths) {
      return paths.filter((path) => !visiblePaths.has(path)).length
    }

    function togglePath(value) {
      setSelected((prev) => {
        const next = Object.assign(Object.create(null), prev)
        if (next[value]) delete next[value]
        else next[value] = true
        return next
      })
    }

    function selectVisible(invert) {
      setSelected((prev) => {
        const next = Object.assign(Object.create(null), prev)
        for (const entry of visible) {
          if (entry.item === 'ignored' || !hasLocalChange(entry)) continue
          if (invert && prev[entry.path]) delete next[entry.path]
          else next[entry.path] = true
        }
        return next
      })
    }

    function openCommitDialog(selection = selectedEntries) {
      const paths = selection.filter(canCommit).map((entry) => entry.path)
      const excluded = selection.filter((entry) => !canCommit(entry)).map((entry) => ({
        path: entry.path,
        reason: hasConflict(entry) ? t('有未解决的冲突')
          : entry.item === 'unversioned' ? t('尚未纳入版本控制') : t('无可提交的变更'),
      }))
      if (!paths.length && !excluded.length) {
        notify(t('请勾选要提交的变更'), 'warn')
        return
      }
      setCommitSelection({ paths, excluded, hidden: countHidden(paths) })
      setCommitMessage('')
    }

    async function submitCommit() {
      if (!commitPaths.length || busy) return
      const message = commitMessage.trim()
      if (!message) {
        notify(t('提交信息不能为空'), 'err')
        return
      }
      const result = await perform(t('正在提交…'), () => api('/commit', { wc: currentPath, paths: commitPaths, message: message }))
      if (!result) return
      notify(t('已提交 r') + result.revision + '（' + commitPaths.length + t(' 个文件）'), 'ok')
      setCommitSelection(null)
      setCommitMessage('')
      setSelected(Object.create(null))
      await refreshAll()
    }

    function askUpdate() {
      setConfirm({
        title: t('更新工作副本'),
        body: t('将从仓库拉取「') + current.name + t('」的最新内容。本地未提交的修改会保留，冲突的文件会被标记出来。'),
        okLabel: t('开始更新'),
        onOk: async () => {
          const result = await perform(t('正在更新…'), () => api('/update', { wc: currentPath }))
          if (!result) return false
          if (result.conflicts) {
            setConflictPath('')
            setTab('conflicts')
          }
          notify(result.conflicts
            ? t('更新完成：r') + result.revision + t('，发现 ') + result.conflicts + t(' 个冲突')
            : t('更新完成：r') + result.revision, result.conflicts ? 'warn' : 'ok')
          setSelected(Object.create(null))
          await refreshAll()
          return true
        },
      })
    }

    function askRevert(selection = selectedEntries) {
      const paths = selection.filter((entry) => entry.item !== 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify(t('先勾选要还原的文件'), 'warn')
        return
      }
      setConfirm({
        title: t('还原修改'),
        body: t('将丢弃这 ') + paths.length + t(' 个文件里未提交的本地修改，此操作不可撤销。'),
        targets: { paths, hidden: countHidden(paths) },
        okLabel: t('还原'),
        danger: true,
        onOk: async () => {
          const result = await perform(t('正在还原…'), () => api('/revert', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify(t('已还原 ') + paths.length + t(' 个文件'))
          setSelected(Object.create(null))
          await refreshAll()
          return true
        },
      })
    }

    function askDelete(selection = selectedEntries) {
      const paths = selection.filter((entry) => entry.item !== 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify(t('先勾选要删除的文件'), 'warn')
        return
      }
      setConfirm({
        title: t('从版本库删除'),
        body: t('将删除下列 ') + paths.length + t(' 个文件或目录。删除目录会包含其下的文件，提交后才会从仓库删除。'),
        targets: { paths, hidden: countHidden(paths) },
        okLabel: t('删除'),
        danger: true,
        onOk: async () => {
          const result = await perform(t('正在删除…'), () => api('/delete', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify(t('已标记删除 ') + paths.length + t(' 项'))
          await refreshAll()
          return true
        },
      })
    }

    function askAdd(selection = selectedEntries) {
      const paths = selection.filter((entry) => entry.item === 'unversioned').map((entry) => entry.path)
      if (!paths.length) {
        notify(t('先勾选未纳入版本控制的文件'), 'warn')
        return
      }
      setConfirm({
        title: t('纳入版本控制'),
        body: t('纳入下列路径后即可提交。选择目录时，也会纳入其中符合条件的子项。'),
        targets: { paths, hidden: countHidden(paths) },
        okLabel: t('纳入'),
        onOk: async () => {
          const result = await perform(t('正在纳入…'), () => api('/add', { wc: currentPath, paths: paths }))
          if (!result) return false
          notify(t('已纳入 ') + paths.length + t(' 个文件'))
          await refreshAll()
          return true
        },
      })
    }

    function openConflicts(selection = selectedEntries) {
      setConflictPath(selection.find(hasConflict)?.path || conflicts[0]?.path || '')
      setTab('conflicts')
    }

    async function doResolve(entry, accept) {
      const result = await perform(t('正在解决冲突…'), () =>
        api('/resolve', { wc: currentPath, paths: [entry.path], accept }))
      if (!result) return
      setConflictPath('')
      await refreshAll()
    }

    function askIgnore(entry) {
      const parent = entry.path.includes('/') ? entry.path.slice(0, entry.path.lastIndexOf('/')) : '.'
      setConfirm({
        title: t('加入忽略规则'),
        body: t('将在「') + parent + t('」目录的 svn:ignore 中加入此名称。提交目录属性后会与团队共享。'),
        detail: entry.path,
        okLabel: t('加入忽略'),
        onOk: async () => {
          const result = await perform(t('正在写入忽略规则…'), () =>
            api('/ignore', { wc: currentPath, path: entry.path }))
          if (!result) return false
          await refreshAll()
          return true
        },
      })
    }

    async function submitPathAction(value) {
      if (pathAction.kind === 'switch') {
        const result = await perform(t('正在切换…'), async () => {
          let switched
          try {
            switched = await api('/switch', { wc: currentPath, destination: value })
            logSeq.current++
            setLog(null)
            setFilterDraft((draft) => ({ ...draft, path: '' }))
            setFilters({ ...filters, path: '' })
            return switched
          } finally {
            previewSeq.current++
            setDetail(null)
            setDiff(null)
            setBlame(null)
            setTab('changes')
            await refreshAll(switched ? { ...filters, path: '' } : filters)
          }
        })
        if (!result) return
        setPathAction(null)
        setSelected(Object.create(null))
        setTab(result.conflicts ? 'conflicts' : 'changes')
        notify(result.conflicts ? t('切换完成，发现冲突') : t('切换完成'), result.conflicts ? 'warn' : 'ok')
        return
      }
      const lock = await perform(t('正在查询文件锁…'), () =>
        api('/lock-info', { wc: currentPath, path: value }))
      if (!lock) return
      const unlock = lock.canUnlock
      const blocked = !!lock.owner && !unlock
      setPathAction(null)
      setConfirm({
        title: blocked ? t('文件锁状态') : unlock ? t('解锁文件') : t('锁定文件'),
        body: lock.owner ? t('仓库锁持有人：') + lock.owner : t('锁定后，其他工作副本不能提交这个文件。'),
        detail: value,
        okLabel: blocked ? t('关闭') : unlock ? t('解锁') : t('锁定'),
        onOk: async () => {
          if (blocked) return true
          const result = await perform(unlock ? t('正在解锁…') : t('正在锁定…'), () =>
            api(unlock ? '/unlock' : '/lock', { wc: currentPath, path: value }))
          if (!result) return false
          notify(unlock ? t('文件已解锁') : t('文件已锁定'))
          await refreshAll()
          return true
        },
      })
    }

    function askCleanup() {
      setConfirm({
        title: t('清理工作副本'),
        body: t('执行 svn cleanup，清理锁和未完成的事务。工作副本被锁住或中断过操作时使用。'),
        okLabel: t('清理'),
        onOk: async () => {
          const result = await perform(t('正在清理…'), () => api('/cleanup', { wc: currentPath }))
          if (!result) return false
          notify(t('清理完成'))
          return true
        },
      })
    }

    function applyFilters() {
      loadLog({ filters: filterDraft })
    }

    function resetFilters() {
      const empty = { author: '', keyword: '', path: '', from: '', to: '' }
      setFilterDraft(empty)
      loadLog({ filters: empty })
    }

    const tabButton = (name, label, count) => h('button', {
      type: 'button',
      className: 'svn-tab' + (tab === name ? ' on' : ''),
      onClick: () => setTab(name),
    }, label, count ? h('span', { className: 'svn-count' }, count) : null)

    const total = status && status.summary ? status.summary.total : 0

    return h('div', { className: 'svn-root svn-shell', onMouseDown: (event) => event.stopPropagation() },
      h('div', { className: 'svn-head' },
        h('div', { className: 'svn-logo' }, 'SVN'),
        h('div', { className: 'svn-headmain' },
          h('div', { className: 'svn-title' },
            t('版本控制'),
            current ? h('span', { className: 'svn-revpill', title: t('当前版本') }, 'r' + current.revision) : null,
          ),
          h('div', { className: 'svn-sub', title: current ? current.path : '' },
            current ? current.name + ' · ' + current.path : t('选择一个工作副本')),
        ),
        h('div', { className: 'svn-head-actions' },
          busy ? h('span', { className: 'svn-busy' }, h(Spinner), busy + ' ' + elapsed + t("s（读取最多 60s，写入最多 300s）")) : null,
          h('button', { type: 'button', className: 'svn-icon', title: t('刷新'), onClick: () => refreshAll(), disabled: !!busy }, '⟳'),
          h('button', { type: 'button', className: 'svn-btn', onClick: askUpdate, disabled: !!busy || !current || current.ok === false }, t('↓ 更新')),
          h('button', { type: 'button', className: 'svn-btn', disabled: !!busy || !current,
            onClick: () => setPathAction({ kind: 'lock', value: '' }) }, t('文件锁')),
          h('button', { type: 'button', className: 'svn-btn', disabled: !!busy || !current,
            onClick: () => setPathAction({ kind: 'switch', value: '' }) }, t('切换分支／标签')),
          h('button', { type: 'button', className: 'svn-btn', disabled: !!busy, onClick: () => setAdvanced(true) }, t("更多 SVN 操作")),
          h('label', null, h('input', { type: 'checkbox', checked: ignored, onChange: (event) => { setIgnored(event.target.checked) } }), t("显示忽略项")),
          h('button', { type: 'button', className: 'svn-btn primary', onClick: () => openCommitDialog(), disabled: !!busy || !current || current.ok === false }, t('✓ 提交')),
        ),
      ),

      h('div', { className: 'svn-body' },
        h(SvnSidebar, {
          state: stateData,
          current: current,
          loading: stateLoading,
          error: stateError,
          busy: busy,
          onCleanup: askCleanup,
          onRetry: () => loadState(false),
        }),

        h('div', { className: 'svn-main' },
          h('div', { className: 'svn-tabs' },
            tabButton('changes', t('更改'), total || ''),
            tabButton('conflicts', t('冲突'), conflicts.length),
            tabButton('history', t('历史'), log && log.entries ? log.entries.length : ''),
            tab === 'diff' ? h('span', { className: 'svn-tab on' }, t('差异')) : null,
            tab === 'blame' ? h('span', { className: 'svn-tab on' }, t('溯源')) : null,
            h('div', { className: 'svn-tabsep' }),
            status ? h('span', { className: 'svn-muted' }, remote ? t('已对比服务器') : t('本地状态')) : null,
          ),

          tab === 'changes' ? h(ChangesView, {
            status: status,
            loading: statusLoading,
            error: statusError,
            selected: selected,
            toggle: togglePath,
            visible,
            hidden: countHidden(selectedEntries.map((entry) => entry.path)),
            selectAll: () => selectVisible(false),
            invert: () => selectVisible(true),
            itemFilter: itemFilter,
            setItemFilter: setItemFilter,
            pathFilter: pathFilter,
            setPathFilter: setPathFilter,
            remote: remote,
            onRemote: () => {
              const next = !remote
              setRemote(next)
              loadStatus({ remote: next })
            },
            onFileHistory: (entry) => {
              const next = { ...filters, path: entry.path }
              setFilterDraft(next)
              setDetail(null)
              setTab('history')
              loadLog({ filters: next })
            },
            onRowDiff: (entry) => openDiff({ title: entry.path, body: { path: entry.path, unversioned: entry.item === 'unversioned' } }),
            onBlame: (entry) => openBlame(entry.path, entry.path),
            onCommit: openCommitDialog,
            onRevert: askRevert,
            onAdd: askAdd,
            onDelete: askDelete,
            onResolve: openConflicts,
            onIgnore: askIgnore,
            onLock: (entry) => setPathAction({ kind: 'lock', value: entry.path }),
            onRetry: () => loadStatus({ remote: remote }),
            busy: busy,
          }) : null,

          tab === 'conflicts' ? h(ConflictView, {
            api, wc: currentPath, conflicts, path: conflictPath, onSelect: setConflictPath,
            onResolve: doResolve, busy, loading: statusLoading, error: statusError,
          }) : null,

          tab === 'history' ? h(HistoryView, {
            log: log,
            loading: logLoading,
            error: logError,
            filters: filterDraft,
            setFilters: setFilterDraft,
            onApply: applyFilters,
            onReset: resetFilters,
            onLoadMore: () => log && loadLog({ append: true, beforeRev: log.nextBefore, filters: filters }),
            detail: detail,
            onSelectDetail: loadDetail,
            onRevisionDiff: (entry) => openDiff({ title: 'r' + entry.revision + t(' 的改动'), body: { revision: entry.revision } }),
            onPathDiff: (entry, item) => openDiff({
              title: 'r' + entry.revision + ' · ' + item.path,
              body: { revision: entry.revision, path: item.path },
            }),
            onPathBlame: (entry, item) => openBlame(item.path, 'r' + entry.revision + ' · ' + item.path, entry.revision),
            onRetry: () => loadLog({ filters: filters }),
          }) : null,

          tab === 'diff' ? h(DiffView, {
            diff: diff,
            onBack: () => setTab(returnTab),
            onBlame: () => {
              if (diff && diff.data && diff.data.relPath) openBlame(diff.data.relPath, diff.data.relPath, diff.data.revision)
            },
          }) : null,

          tab === 'blame' ? h(BlameView, {
            blame: blame,
            onBack: () => setTab(returnTab),
            onRevisionDiff: (revision) => openDiff({ title: 'r' + revision + t(' 的改动'), body: { revision: revision } }),
          }) : null,
        ),
      ),

      advanced ? h(AdvancedDialog, { api, current, busy, onClose: () => setAdvanced(false), onChanged: refreshAll }) : null,
      toast ? h('div', { className: 'svn-toast' + (toast.kind === 'err' ? ' err' : toast.kind === 'warn' ? ' warn' : '') }, toast.message) : null,

      confirm ? h(ConfirmDialog, {
        title: confirm.title,
        body: confirm.body,
        detail: confirm.detail,
        targets: confirm.targets,
        danger: confirm.danger,
        okLabel: confirm.okLabel,
        busy: busy,
        onOk: confirm.onOk,
        onClose: () => setConfirm(null),
      }) : null,

      commitSelection ? h(CommitDialog, {
        ...commitSelection,
        message: commitMessage,
        setMessage: setCommitMessage,
        busy: busy,
        onClose: () => { if (!busy) setCommitSelection(null) },
        onSubmit: submitCommit,
      }) : null,

      pathAction ? h(PathActionDialog, {
        action: pathAction, current, busy,
        onClose: () => { if (!busy) setPathAction(null) },
        onSubmit: submitPathAction,
      }) : null,

    )
  }

  //#endregion

  //#region 侧栏

  function SvnSidebar(props) {
    const state = props.state
    const current = props.current
    const copies = (state && state.workingCopies) || []

    return h('div', { className: 'svn-side' },
      h('div', null,
        h('div', { className: 'svn-side-title' }, t('工作副本')),
        props.loading ? h('div', { className: 'svn-loading', style: { flex: 'none', padding: 12 } }, h(Spinner), t('加载中…')) : null,
        props.error ? h('div', { className: 'svn-errorbox', style: { margin: '8px 0' } },
          h('span', null, props.error),
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, t('重试')),
        ) : null,
        !props.loading && !copies.length ? h('div', { className: 'svn-side-empty' },
          t('请在 CC GUI 打开本机 SVN 工作区。'),
        ) : null,
        copies.map((item) => h('div', {
          key: item.path,
          className: 'svn-wc' + (current && current.path === item.path ? ' on' : ''),
          title: item.path,
        },
          h('div', { className: 'svn-wc-name' },
            h('span', { className: 'svn-dot' + (item.ok === false ? ' bad' : '') }),
            item.name || item.path,
            item.revision ? h('span', { className: 'svn-revpill' }, 'r' + item.revision) : null,
          ),
          h('div', { className: 'svn-wc-path' }, item.ok === false ? (item.error || t('不可用')) : item.path),
        )),
      ),

      current && current.ok !== false ? h('div', null,
        h('div', { className: 'svn-side-title' }, t('仓库')),
        h('div', { className: 'svn-kv' },
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, 'URL'), h('span', { className: 'svn-kv-v', title: current.url }, current.url || '-')),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, t('仓库根')), h('span', { className: 'svn-kv-v', title: current.root }, current.root || '-')),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, t('最后修改')), h('span', { className: 'svn-kv-v' }, 'r' + current.lastChangedRev + ' · ' + (current.lastChangedAuthor || '-'))),
          h('div', { className: 'svn-kv-row' }, h('span', { className: 'svn-kv-k' }, t('时间')), h('span', { className: 'svn-kv-v' }, fmtDate(current.lastChangedDate))),
        ),
        h('div', { style: { display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' } },
          h('button', { type: 'button', className: 'svn-btn small', onClick: props.onCleanup, disabled: !!props.busy }, t('清理锁')),
        ),
      ) : null,

    )
  }

  //#endregion

  //#region 更改视图

  function ChangesView(props) {
    const [menu, setMenu] = useState(null)
    const menuRef = useRef(null)

    useEffect(() => {
      if (!menu) return
      function dismiss(event) {
        if (event.type === 'keydown' && event.key !== 'Escape') return
        if (event.type === 'pointerdown' && menuRef.current?.contains(event.target)) return
        setMenu(null)
      }
      window.addEventListener('pointerdown', dismiss, true)
      window.addEventListener('keydown', dismiss, true)
      window.addEventListener('blur', dismiss)
      return () => {
        window.removeEventListener('pointerdown', dismiss, true)
        window.removeEventListener('keydown', dismiss, true)
        window.removeEventListener('blur', dismiss)
      }
    }, [menu])

    const status = props.status
    const entries = (status && status.entries) || []
    const summary = (status && status.summary) || {}
    const visible = props.visible
    const selectedCount = entries.filter((entry) => props.selected[entry.path]).length
    const contextEntry = menu && entries.find((entry) => entry.path === menu.path)
    const selection = contextEntry && (props.selected[contextEntry.path]
      ? entries.filter((entry) => props.selected[entry.path])
      : [contextEntry])
    const hasVersioned = selection?.some((entry) => entry.item !== 'unversioned')
    const actions = contextEntry && [
      [t('查看差异'), () => props.onRowDiff(contextEntry)],
      [t('查看文件历史'), () => props.onFileHistory(contextEntry), contextEntry.item === 'unversioned'],
      [t('逐行溯源'), () => props.onBlame(contextEntry), contextEntry.item === 'unversioned'],
      [t('纳入版本控制'), () => props.onAdd(selection), !selection.some((entry) => entry.item === 'unversioned')],
      [t('提交所选'), () => props.onCommit(selection), !selection.length],
      [t('还原修改'), () => props.onRevert(selection), !hasVersioned],
      [t('打开冲突工作台'), () => props.onResolve(selection), !selection.some(hasConflict)],
      [t('加入忽略规则'), () => props.onIgnore(contextEntry), contextEntry.item !== 'unversioned'],
      [t('查询文件锁'), () => props.onLock(contextEntry), contextEntry.item === 'unversioned'],
      [t('从版本控制删除'), () => props.onDelete(selection), !hasVersioned],
    ]
    const chips = [
      ['conflicted', t('冲突')], ['modified', t('修改')], ['added', t('新增')],
      ['deleted', t('删除')], ['missing', t('丢失')], ['unversioned', t('未纳入')],
    ]

    return h('div', { className: 'svn-view' },
      h('div', { className: 'svn-chips' },
        h('button', {
          type: 'button', className: 'svn-chip' + (props.itemFilter === 'all' ? ' on' : ''),
          onClick: () => props.setItemFilter('all'),
        }, t('全部 '), h('b', null, summary.total || 0)),
        chips.filter(([key]) => summary[key]).map(([key, label]) => h('button', {
          key: key,
          type: 'button',
          className: 'svn-chip' + (props.itemFilter === key ? ' on' : ''),
          onClick: () => props.setItemFilter(props.itemFilter === key ? 'all' : key),
        }, label, ' ', h('b', null, summary[key]))),
        summary.props ? h('span', { className: 'svn-muted', title: t('属性被修改的文件数') }, t('· 属性 ') + summary.props) : null,
      ),

      h('div', { className: 'svn-toolbar' },
        h('input', {
          className: 'svn-input grow',
          placeholder: t('过滤路径…'),
          value: props.pathFilter,
          onChange: (event) => props.setPathFilter(event.target.value),
        }),
        h('button', {
          type: 'button',
          className: 'svn-btn small' + (props.remote ? ' primary' : ''),
          onClick: props.onRemote,
          disabled: props.loading,
          title: t('svn status -u：对比服务器上的新版本'),
        }, props.remote ? t('✓ 已对比服务器') : t('对比服务器')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry, disabled: props.loading }, t('刷新')),
      ),

      props.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, props.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, t('重试')),
      ) : null,

      h('div', { className: 'svn-list' },
        props.loading && !status ? h('div', { className: 'svn-loading' }, h(Spinner), t('读取工作副本状态…')) : null,
        !props.loading && status && visible.length === 0 ? h(Empty, {
          icon: '✓',
          title: entries.length ? t('没有符合筛选条件的文件') : t('工作副本没有本地更改'),
          hint: entries.length ? t('试试切换上方的状态筛选或清空过滤。') : t('可以点右上角「更新」拉取最新版本。'),
        }) : null,
        visible.map((entry) => {
          const remoteLabel = props.remote ? remoteStatusLabel(entry.reposStatus) : ''
          const parts = splitPath(entry.path)
          return h('div', {
            key: entry.path,
            className: 'svn-row' + (props.selected[entry.path] ? ' sel' : '') + (hasConflict(entry) ? ' conflict' : ''),
            onClick: () => props.onRowDiff(entry),
            onContextMenu: (event) => {
              event.preventDefault()
              if (props.busy || props.loading) return
              setMenu({
                path: entry.path,
                left: Math.max(8, Math.min(event.clientX, window.innerWidth - 180)),
                top: Math.max(8, Math.min(event.clientY, window.innerHeight - 290)),
              })
            },
            title: entry.path + (entry.commit ? t('\n最后提交：r') + entry.commit.revision + ' ' + (entry.commit.author || '') : ''),
          },
            h('input', {
              type: 'checkbox',
              checked: !!props.selected[entry.path],
              onClick: (event) => event.stopPropagation(),
              onChange: () => props.toggle(entry.path),
            }),
            h(StatusBadge, { item: displayStatus(entry) }),
            h('span', { className: 'svn-path' },
              parts[0] ? h('span', { className: 'svn-dir' }, parts[0]) : null,
              parts[1],
              entry.props === 'modified' ? h('span', { className: 'svn-prop', title: t('属性有修改') }, 'P') : null,
            ),
            entry.lockOwner ? h('span', { className: 'svn-prop' }, t('锁：') + entry.lockOwner) : null,
            remoteLabel ? h('span', { className: 'svn-prop' }, t('远端：') + remoteLabel) : null,
            entry.props === 'conflicted' ? h('span', { className: 'svn-tag' }, t('属性冲突')) : null,
            entry.treeConflicted ? h('span', { className: 'svn-tag' }, t('树冲突')) : null,
            entry.copied ? h('span', { className: 'svn-tag', style: { background: 'rgba(48,164,108,.16)', color: '#2f9e68' } }, t('复制')) : null,
            h('button', {
              type: 'button',
              className: 'svn-icon',
              style: { width: 22, height: 22, fontSize: 11 },
              title: t('逐行溯源（blame）'),
              onClick: (event) => { event.stopPropagation(); props.onBlame(entry) },
            }, t('溯')),
          )
        }),
        props.loading && status ? h('div', { className: 'svn-loading', style: { flex: 'none', padding: 10 } }, h(Spinner), t('刷新中…')) : null,
      ),

      actions && h('div', {
        ref: menuRef,
        className: 'svn-file-menu',
        style: { left: menu.left, top: menu.top },
        'aria-label': t('SVN 文件操作'),
      }, actions.map(([label, run, unavailable]) => h('button', {
        key: label,
        type: 'button',
        className: 'svn-btn small',
        disabled: unavailable || props.busy || props.loading,
        onClick: () => { setMenu(null); run() },
      }, label))),

      h('div', { className: 'svn-footer' },
        h('span', { className: 'svn-muted' }, t('已选 ') + selectedCount + (props.hidden ? t(' 项，其中 ') + props.hidden + t(' 项当前不可见') : t(' 项'))),
        h('div', { className: 'svn-footer-gap' }),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.selectAll }, t('全选')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.invert }, t('反选')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: () => props.onAdd(), disabled: !!props.busy }, t('纳入')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: () => props.onResolve(), disabled: !!props.busy }, t('解决冲突')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: () => props.onRevert(), disabled: !!props.busy }, t('还原')),
        h('button', { type: 'button', className: 'svn-btn small danger', onClick: () => props.onDelete(), disabled: !!props.busy }, t('删除')),
        h('button', { type: 'button', className: 'svn-btn primary', onClick: () => props.onCommit(), disabled: !!props.busy || !(summary.total || 0) }, t('提交所选')),
      ),
    )
  }

  //#endregion

  //#region 历史视图

  function HistoryView(props) {
    const log = props.log
    const entries = (log && log.entries) || []
    const detail = props.detail
    const filters = props.filters || {}

    return h('div', { className: 'svn-view' },
      h('div', { className: 'svn-toolbar' },
        h('input', {
          className: 'svn-input sm',
          placeholder: t('作者'),
          value: filters.author || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { author: event.target.value })),
        }),
        h('input', {
          className: 'svn-input grow',
          placeholder: t('关键词（提交信息 / 作者）'),
          value: filters.keyword || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { keyword: event.target.value })),
          onKeyDown: (event) => { if (event.key === 'Enter') props.onApply() },
        }),
        h('input', {
          className: 'svn-input md',
          placeholder: t('限定路径'),
          value: filters.path || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { path: event.target.value })),
          onKeyDown: (event) => { if (event.key === 'Enter') props.onApply() },
        }),
        h('input', {
          className: 'svn-input sm',
          type: 'date',
          title: t('起始日期'),
          value: filters.from || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { from: event.target.value })),
        }),
        h('input', {
          className: 'svn-input sm',
          type: 'date',
          title: t('结束日期'),
          value: filters.to || '',
          onChange: (event) => props.setFilters(Object.assign({}, filters, { to: event.target.value })),
        }),
        h('button', { type: 'button', className: 'svn-btn small primary', onClick: props.onApply, disabled: props.loading }, t('查询')),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onReset, disabled: props.loading }, t('重置')),
      ),

      props.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, props.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, t('重试')),
      ) : null,

      h('div', { className: 'svn-history' },
        h('div', { className: 'svn-log' },
          h('div', { className: 'svn-log-list' },
            props.loading && !log ? h('div', { className: 'svn-loading' }, h(Spinner), t('读取提交历史…')) : null,
            !props.loading && log && entries.length === 0 ? h(Empty, {
              icon: '⌗',
              title: t('没有匹配的提交记录'),
              hint: t('试试放宽作者 / 关键词 / 日期，或清空「限定路径」。'),
            }) : null,
            entries.map((entry) => h('div', {
              key: entry.revision,
              className: 'svn-logrow' + (detail && detail.revision === entry.revision ? ' sel' : ''),
              onClick: () => props.onSelectDetail(entry),
            },
              h('span', { className: 'svn-rev' }, 'r' + entry.revision),
              h('div', { className: 'svn-logmain' },
                h('div', { className: 'svn-logmsg' }, firstLine(entry.message) || t('(无提交信息)')),
                h('div', { className: 'svn-logmeta' },
                  (entry.author || t('(无作者)')) + ' · ' + fmtDate(entry.date),
                ),
              ),
            )),
            log && log.hasMore ? h('div', { className: 'svn-logmore' },
              h('button', { type: 'button', className: 'svn-btn small', onClick: props.onLoadMore, disabled: props.loading },
                props.loading ? t('加载中…') : t('加载更早的提交')),
            ) : null,
          ),
        ),
        h('div', { className: 'svn-detail' },
          detail ? h(CommitDetail, {
            entry: detail,
            onRetry: () => props.onSelectDetail(detail),
            onRevisionDiff: props.onRevisionDiff,
            onPathDiff: props.onPathDiff,
            onPathBlame: props.onPathBlame,
          }) : h('div', { className: 'svn-detail-empty' },
            h('div', null, t('选择左侧的一条提交记录'), h('br'), t('查看提交信息、改动文件与版本差异')),
          ),
        ),
      ),
    )
  }

  function CommitDetail(props) {
    const entry = props.entry
    return h('div', null,
      h('div', { className: 'svn-detail-head' },
        h('span', { className: 'svn-rev' }, 'r' + entry.revision),
        h('span', { className: 'svn-detail-author' }, entry.author || t('(无作者)')),
        h('span', { className: 'svn-detail-date' }, fmtDate(entry.date)),
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 5 } },
          h(CopyButton, {
            type: 'button', className: 'svn-btn small', title: t('复制版本号'),
            text: String(entry.revision),
          }, t('复制版本')),
          h('button', { type: 'button', className: 'svn-btn small primary', onClick: () => props.onRevisionDiff(entry) }, t('查看此版本差异')),
        ),
      ),
      h('pre', { className: 'svn-msg' }, entry.message || t('(无提交信息)')),
      entry.loading ? h('div', { className: 'svn-hint', role: 'status' }, t('正在读取改动路径…')) : null,
      entry.error ? h('div', { className: 'svn-errorbox' },
        h('span', null, entry.error),
        h('button', { type: 'button', className: 'svn-btn small', onClick: props.onRetry }, t('重试')),
      ) : null,
      !entry.loading && !entry.error ? h('div', { className: 'svn-section' }, t('改动文件 ') + (entry.paths ? entry.paths.length : 0)) : null,
      entry.paths && entry.paths.length ? h('div', { className: 'svn-pathlist' },
        entry.paths.map((item, index) => {
          const action = actionMeta(item.action)
          return h('div', {
            key: index + ':' + item.path,
            className: 'svn-pathrow',
            onClick: () => props.onPathDiff(entry, item),
            title: t('查看该文件在此版本中的差异'),
          },
            h('span', { className: 'svn-action', style: { background: action.bg, color: action.color } }, item.action),
            h('span', { className: 'svn-path' }, item.path),
            item.copyFrom ? h('span', { className: 'svn-tag', title: t('复制自 ') + item.copyFrom + '@' + item.copyFromRev }, 'copy') : null,
            h('button', {
              type: 'button', className: 'svn-icon', style: { width: 22, height: 22, fontSize: 10 },
              title: t('查看该版本中此文件的逐行溯源'),
              onClick: (event) => { event.stopPropagation(); props.onPathBlame(entry, item) },
            }, t('溯')),
          )
        }),
      ) : !entry.loading && !entry.error ? h('div', { className: 'svn-hint' }, t('这个版本没有记录改动路径。')) : null,
      h('div', { className: 'svn-hint', style: { marginTop: 12 } }, t('提示：点文件看该版本中的差异；「溯」按该版本溯源。')),
    )
  }

  //#endregion

  //#region 差异 / 溯源

  function DiffView(props) {
    const state = props.diff
    const [wrap, setWrap] = useState(false)
    if (!state) return null

    if (state.loading) {
      return h('div', { className: 'svn-view' },
        h('div', { className: 'svn-diff-head' },
          h('span', { className: 'svn-diff-title' }, state.title),
          props.onBack ? h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, t('← 返回')) : null,
        ),
        h('div', { className: 'svn-loading' }, h(Spinner), t('计算差异…')),
      )
    }

    if (state.error) {
      return h('div', { className: 'svn-view' },
        h('div', { className: 'svn-diff-head' },
          h('span', { className: 'svn-diff-title' }, state.title),
          props.onBack ? h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, t('← 返回')) : null,
        ),
        h('div', { className: 'svn-errorbox' }, h('span', null, state.error)),
      )
    }

    const data = state.data || {}
    const lines = parseDiff(data.diff || '')
    const shown = lines.slice(0, 4000)

    return h('div', { className: 'svn-view svn-diff' },
      h('div', { className: 'svn-diff-head' },
        props.onBack ? h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, t('← 返回')) : null,
        h('span', { className: 'svn-diff-title', title: state.title }, state.title),
        data.relPath ? h('span', { className: 'svn-muted' }, data.relPath) : null,
        h('span', { className: 'svn-stat add' }, '+' + (data.additions || 0)),
        h('span', { className: 'svn-stat del' }, '-' + (data.deletions || 0)),
        data.truncated ? h('span', { className: 'svn-tag' }, t('已截断')) : null,
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: 5 } },
          props.onBlame && data.relPath && !data.synthesized ? h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBlame, title: t('查看该文件的逐行溯源') }, t('溯源')) : null,
          h(CopyButton, { type: 'button', className: 'svn-btn small', text: data.diff || '' }, t('复制差异')),
          h('button', { type: 'button', className: 'svn-btn small' + (wrap ? ' primary' : ''), onClick: () => setWrap(!wrap) }, t('换行')),
        ),
      ),
      data.binary ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, t('文件被标记为二进制，文本差异无法显示。')) : null,
      data.outsideWc ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, t('该路径不在当前工作副本内，显示的是整个版本的差异。')) : null,
      data.synthesized ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } }, t('该文件未纳入版本控制，下面按「新增」展示工作副本内容。')) : null,
      data.empty ? h(Empty, { icon: '≡', title: t('没有差异'), hint: t('工作副本与版本库在这一范围里内容一致。') }) : h('div', { className: 'svn-diff-body' + (wrap ? ' wrap' : '') },
        shown.map((line, index) => h('div', { key: index, className: 'svn-dline ' + line.type },
          h('span', { className: 'svn-dno' }, line.oldNo === undefined ? '' : line.oldNo),
          h('span', { className: 'svn-dno' }, line.newNo === undefined ? '' : line.newNo),
          h('span', { className: 'svn-dtext' }, line.text === '' ? ' ' : line.text),
        )),
        lines.length > shown.length ? h('div', { className: 'svn-hint', style: { padding: '8px 12px' } },
          t('差异共 ') + lines.length + t(' 行，仅显示前 ') + shown.length + t(' 行；完整内容可复制。'),
        ) : null,
      ),
    )
  }

  function BlameView(props) {
    const state = props.blame
    if (!state) return null

    const header = (right) => h('div', { className: 'svn-diff-head' },
      h('button', { type: 'button', className: 'svn-btn small', onClick: props.onBack }, t('← 返回')),
      h('span', { className: 'svn-diff-title' }, 'blame · ' + state.label),
      right || null,
    )

    if (state.loading) {
      return h('div', { className: 'svn-view' }, header(), h('div', { className: 'svn-loading' }, h(Spinner), t('逐行溯源…')))
    }
    if (state.error) {
      return h('div', { className: 'svn-view' }, header(), h('div', { className: 'svn-errorbox' }, h('span', null, state.error)))
    }

    const data = state.data || {}
    const lines = (data.lines || []).slice(0, 3000)
    return h('div', { className: 'svn-view svn-blame' },
      header(h(React.Fragment, null,
        data.remote ? h('span', { className: 'svn-tag', title: t('该文件按仓库版本溯源，不含本地未提交的改动') }, t('仓库版本')) : null,
        h('span', { className: 'svn-muted' }, data.total + t(' 行')),
      )),
      h('div', { className: 'svn-blame-body' },
        lines.map((line) => h('div', { key: line.line, className: 'svn-blame-row' },
          h('span', { className: 'svn-blame-no' }, line.line),
          h('span', {
            className: 'svn-blame-rev',
            title: line.revision ? t('查看 r') + line.revision + t(' 的差异') : t('本地未提交的改动'),
            onClick: () => { if (line.revision && props.onRevisionDiff) props.onRevisionDiff(line.revision) },
          }, line.revision ? 'r' + line.revision : '-'),
          h('span', { className: 'svn-blame-author', title: line.author || '' }, line.author || '-'),
          h('span', { className: 'svn-blame-text' }, line.text === '' ? ' ' : line.text),
        )),
        (data.lines || []).length > lines.length ? h('div', { className: 'svn-hint', style: { padding: 8 } },
          t('共 ') + data.total + t(' 行，仅显示前 ') + lines.length + t(' 行。'),
        ) : null,
      ),
    )
  }

  //#endregion

  //#region 提交 / 解决 / 添加 / 设置

  function TargetPaths({ paths, hidden }) {
    if (!paths.length) return null
    return h('details', { open: true },
      h('summary', null, t('操作路径（') + paths.length + t(' 项') +
        (hidden ? t('，其中 ') + hidden + t(' 项当前不可见') : '') + '）'),
      h('pre', { className: 'svn-msg', style: { maxHeight: 160 } }, paths.join('\n')),
    )
  }

  function CommitDialog(props) {
    return h(Modal, {
      title: t('提交 ') + props.paths.length + t(' 项'),
      width: 640,
      onClose: props.onClose,
      footer: h(React.Fragment, null,
        h('button', { type: 'button', className: 'svn-btn', onClick: props.onClose, disabled: !!props.busy }, t('取消')),
        h('button', {
          type: 'button',
          className: 'svn-btn primary',
          onClick: props.onSubmit,
          disabled: !!props.busy || !props.paths.length || !props.message.trim(),
        }, props.busy || t('提交')),
      ),
    },
      h(TargetPaths, { paths: props.paths, hidden: props.hidden }),
      props.excluded.length ? h('details', { open: true },
        h('summary', null, props.excluded.length + t(' 项已排除')),
        h('ul', { className: 'svn-commit-list' }, props.excluded.map(({ path, reason }) =>
          h('li', { key: path }, path + '（' + reason + '）'))),
      ) : null,
      h('textarea', {
        className: 'svn-textarea',
        placeholder: t('提交信息（必填）…  Ctrl+Enter 提交'),
        value: props.message,
        autoFocus: true,
        onChange: (event) => props.setMessage(event.target.value),
        onKeyDown: (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') props.onSubmit()
        },
      }),
      h('div', { className: 'svn-hint' }, t('提交信息以 UTF-8 写入仓库；失败或超时后请核对工作副本及提交历史。')),
    )
  }

  function PathActionDialog({ action, current, busy, onClose, onSubmit }) {
    const [value, setValue] = useState(action.value)
    const switching = action.kind === 'switch'
    return h(Modal, {
      title: switching ? t('切换分支／标签') : t('查询文件锁'),
      width: 500,
      onClose,
      footer: h('button', { type: 'button', className: 'svn-btn primary',
        disabled: !!busy || !value.trim(),
        onClick: () => onSubmit(switching ? value.trim() : value),
      }, busy || (switching ? t('切换') : t('查询'))),
    },
    switching ? h('div', null, t('当前：') + (current.relativeUrl || current.url)) : null,
    h('label', null, switching ? t(t("目标仓库路径")) : t('文件相对工作副本根目录的路径'),
      h('input', {
        className: 'svn-input', value, disabled: !!busy,
        placeholder: switching ? t('^/branches/release 或 ^/tags/v1.0') : 'docs/design.docx',
        onChange: (event) => setValue(event.target.value),
      }),
    ),
    switching ? h('div', { className: 'svn-hint' }, t('切换前请提交或还原本地变更。')) : null)
  }

  function ConflictView({ api, wc, conflicts, path, onSelect, onResolve, busy, loading, error }) {
    if (error) return h('div', { className: 'svn-errorbox' }, error)
    const entry = conflicts.find((item) => item.path === path) || conflicts[0]
    return entry ? h('div', { className: 'svn-view' },
      h('div', { className: 'svn-toolbar' },
        h('label', null, t('冲突路径 '),
          h('select', { className: 'svn-input', value: entry.path, disabled: !!busy,
            onChange: (event) => onSelect(event.target.value),
          }, conflicts.map((item) => h('option', { key: item.path, value: item.path }, item.path))),
        ),
      ),
      h(ConflictDetails, { key: JSON.stringify([entry.path, entry.item, entry.props, entry.treeConflicted]),
        api, wc, entry, onResolve, busy: busy || loading }),
    ) : h(Empty, { icon: '✓', title: loading ? t('正在读取冲突…') : t('没有未解决的冲突') })
  }

  function ConflictDetails({ api, wc, entry, onResolve, busy }) {
    const [details, setDetails] = useState(null)
    const [diff, setDiff] = useState({ loading: true })
    const [accept, setAccept] = useState('')
    const text = entry.item === 'conflicted' && !entry.treeConflicted
    const [incoming, setIncoming] = useState(false)
    useEffect(() => {
      let active = true
      api('/conflict', { wc, path: entry.path }).then(
        (data) => { if (active) setDetails({ data }) },
        (error) => { if (active) setDetails({ error: error.message }) },
      )
      return () => { active = false }
    }, [api, wc, entry.path])
    useEffect(() => {
      if (entry.treeConflicted) return
      let active = true
      api(incoming ? '/conflict-incoming' : '/diff', { wc, path: entry.path }).then(
        (data) => { if (active) setDiff({ data }) },
        (error) => { if (active) setDiff({ error: error.message }) },
      )
      return () => { active = false }
    }, [api, wc, entry.path, entry.treeConflicted, incoming])
    return h(React.Fragment, null,
      h('div', { className: 'svn-toolbar' },
        h('span', null, [entry.item === 'conflicted' && t('内容冲突'), entry.props === 'conflicted' && t('属性冲突'),
          entry.treeConflicted && t('树冲突')].filter(Boolean).join(' · ')),
        h('select', { className: 'svn-input', value: accept, disabled: !!busy,
          'aria-label': t('解决方式'), onChange: (event) => setAccept(event.target.value),
        },
        h('option', { value: '' }, t('选择解决方式')),
        h('option', { value: 'working' }, t('已手工处理，保留当前状态')),
        text && entry.props !== 'conflicted' ? h('option', { value: 'mine-full' }, t('覆盖为冲突前的本地版本')) : null,
        text && entry.props !== 'conflicted' ? h('option', { value: 'theirs-full' }, t('覆盖为传入版本')) : null),
        h('button', { type: 'button', className: 'svn-btn primary', disabled: !!busy || !accept,
          onClick: () => onResolve(entry, accept),
        }, t('确认解决')),
      ),
      h('div', { className: 'svn-hint' }, entry.treeConflicted
        ? t('请先在工作副本中处理文件或目录的结构冲突，再确认解决。')
        : t('查看差异中的冲突标记。保留当前状态前，请先手工移除冲突标记。')),
      details?.error ? h('div', { className: 'svn-errorbox' }, details.error) : null,
      details?.data?.map((item, index) => h('div', { key: index, className: 'svn-hint' },
        [item.operation, item.action, item.reason, ...item.versions].filter(Boolean).join(' · '))),
      text ? h('div', { className: 'svn-toolbar' },
        h('button', { type: 'button', className: 'svn-btn small', onClick: () => {
          setDiff({ loading: true })
          setIncoming(!incoming)
        } }, incoming ? t('查看工作副本差异') : t('查看传入改动')),
      ) : null,
      !entry.treeConflicted ? h(DiffView, {
        diff: { ...diff, title: entry.path + (incoming ? t(' · 传入改动') : t(' · 工作副本与 BASE')) },
      }) : null,
    )
  }

  function AdvancedDialog({ api, current, checkoutOnly, onClose, onChanged }) {
    const [kind, setKind] = useState(checkoutOnly ? 'checkout' : current ? 'diagnose' : 'operations')
    const [values, setValues] = useState({ path: '.', source: current?.relativeUrl || '^/trunk', revision: 'HEAD', dryRun: true })
    const [working, setWorking] = useState(false)
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')
    const [, rerender] = useState(0)
    useEffect(() => {
      const listener = () => rerender((value) => value + 1)
      operationListeners.add(listener)
      return () => operationListeners.delete(listener)
    }, [])
    const definitions = {
      checkout: [t("检出"), [['url', t("仓库 URL")], ['directory', t("本机绝对目标目录")], ['revision', t("修订（HEAD 或数字）")]]],
      diagnose: [t("连接诊断"), []],
      merge: [t("合并"), [['source', t("来源仓库路径（^/branches/name）")], ['range', t("修订范围（如 10:12）")]]],
      copy: [t("创建分支／标签"), [['source', t("来源仓库路径")], ['destination', t("目标仓库路径")], ['revision', t("来源修订")], ['message', t("提交说明")]]],
      properties: [t("读取属性"), [['path', t("工作副本相对路径")]]],
      'property-set': [t("设置属性／忽略规则"), [['path', t("工作副本相对路径")], ['name', t("属性名（忽略规则用 svn:ignore）")], ['value', t("完整属性值（将替换原值；每行一条忽略规则）")]]],
      'property-delete': [t("删除属性"), [['path', t("工作副本相对路径")], ['name', t("属性名")]]],
      operations: [t("操作记录"), []],
    }
    const [title, fields] = definitions[kind]
    async function execute() {
      setWorking(true)
      setError('')
      setOutput('')
      try {
        const result = await api('/' + kind, { wc: current?.path, ...values })
        if (kind === 'properties') {
          setOutput(result.map((item) => item.name + (item.encoding ? t("（编码：") + item.encoding + t("，请勿作为文本覆盖）") : '') + '\n' + item.value).join('\n\n') || t("无属性"))
        } else setOutput(result.output || (kind === 'checkout' ? t("检出并登记成功，关闭后可选择新工作区。") : t("操作完成，请核对状态；有冲突时进入冲突工作台。")))
      } catch (err) { setError(diagnose(err)) }
      finally {
        try { if (kind !== 'checkout') await onChanged?.() }
        finally { setWorking(false) }
      }
    }
    return h(Modal, { title: t("SVN 操作"), width: 700, onClose: working ? () => {} : onClose,
      footer: kind === 'operations' ? null : h('button', { type: 'button', className: 'svn-btn primary', disabled: working,
        onClick: execute }, working ? t("执行中（读取最多 60 秒，写入最多 300 秒）…") : t('确定') + ' · ' + title),
    },
      !checkoutOnly ? h('select', { className: 'svn-input', value: kind, disabled: working,
        'aria-label': t("SVN 操作类型"), onChange: (event) => { setKind(event.target.value); setOutput(''); setError('') },
      }, Object.entries(definitions).filter(([key]) => key !== 'checkout' && (current || key === 'operations')).map(([key, [label]]) => h('option', { key, value: key }, label))) : null,
      fields.map(([key, label]) => h('label', { key, style: { display: 'block', marginTop: 10 } }, label,
        h(key === 'value' || key === 'message' ? 'textarea' : 'input', { className: 'svn-input', value: values[key] || '', disabled: working,
          'aria-label': label, style: { width: '100%' }, onChange: (event) => setValues({ ...values, [key]: event.target.value }) }))),
      kind === 'merge' ? h('label', null, h('input', { type: 'checkbox', checked: values.dryRun, disabled: working,
        onChange: (event) => setValues({ ...values, dryRun: event.target.checked }) }), t("仅预演（不修改工作副本）；正式合并前请先预演")) : null,
      kind === 'property-set' || kind === 'property-delete' ? h('div', { className: 'svn-hint' }, t("请先读取属性。设置会替换该属性的完整值；修改后需要提交。继承属性不在此处编辑。")) : null,
      kind === 'diagnose' ? h('div', { className: 'svn-hint' }, t("复用本机 SVN 凭据和 servers 代理配置，不读取密码；连接失败请在终端对同一工作副本执行 svn info。")) : null,
      kind === 'checkout' ? h('div', { className: 'svn-hint' }, t("目标请使用新目录；SVN 失败可能留下部分工作副本，请核对后再重试。不会自动删除目标内容。")) : null,
      kind === 'operations' ? h('div', null, h('div', { className: 'svn-hint' }, t("当前插件会话最近 100 次命令，不记录参数、提交说明或凭据。")),
        operations.map((item, index) => h('pre', { key: index, className: 'svn-msg', style: { whiteSpace: 'pre-wrap' } },
          new Date(item.started).toLocaleString() + ' svn ' + item.command + ' ' + item.elapsed + t("ms 退出码：") + (item.code ?? t("未返回")) + '\n' + item.detail)),
        h(CopyButton, { type: 'button', className: 'svn-btn', text: operations.map((item) => JSON.stringify(item)).join('\n') }, t("复制脱敏操作记录"))) : null,
      output ? h('pre', { className: 'svn-msg', style: { whiteSpace: 'pre-wrap' } }, output) : null,
      error ? h('pre', { className: 'svn-errorbox', style: { whiteSpace: 'pre-wrap' } }, error) : null,
    )
  }

  function WorkspacePanel() {
    const [, setLocale] = useState(ctx.host?.locale)
    useEffect(() => {
      const observer = new window.MutationObserver(() => setLocale(ctx.host?.locale))
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
      return () => observer.disconnect()
    }, [])
    const [checkout, setCheckout] = useState(false)
    async function reloadWorkspaces() {
      const rows = (await ctx.workspaces.list()).filter((row) => isAbsolute(row.path) && row.kind !== 'worktree')
      setWorkspaces(rows)
      setWorkspacePath((path) => rows.some((row) => row.path === path) ? path : rows.at(-1)?.path || '')
    }
    const [workspaces, setWorkspaces] = useState([])
    const [workspacePath, setWorkspacePath] = useState('')
    const [message, setMessage] = useState(t('正在读取工作区…'))
    const api = useMemo(() => makeApi(workspacePath), [workspacePath])

    useEffect(() => {
      let active = true
      ctx.workspaces.list().then((rows) => {
        if (!active) return
        const localRows = rows.filter((row) => isAbsolute(row.path) && row.kind !== 'worktree')
        localRows.sort((left, right) => (right.lastOpenedAt ?? 0) - (left.lastOpenedAt ?? 0))
        setWorkspaces(localRows)
        setWorkspacePath(localRows[0]?.path || '')
        setMessage(localRows.length ? '' : t('请先在 CC GUI 添加本机 SVN 工作区。'))
      }).catch((error) => {
        if (active) setMessage(t('读取工作区失败：') + error.message)
      })
      return () => { active = false }
    }, [])

    return h('div', { className: 'svn-root svn-center' },
      message && workspaces.length ? h('div', { className: 'svn-errorbox', role: 'alert' }, message) : null,
      h('button', { type: 'button', className: 'svn-btn', onClick: () => setCheckout(true) }, t("检出工作副本")),
      checkout ? h(AdvancedDialog, { api, checkoutOnly: true, onClose: () => { setCheckout(false); reloadWorkspaces().catch((error) => setMessage(diagnose(error))) } }) : null,
      workspaces.length ? h('label', { className: 'svn-workspace-picker' },
        h('span', { className: 'svn-side-title' }, t('工作区')),
        h('select', {
          className: 'svn-input',
          value: workspacePath,
          onChange: (event) => setWorkspacePath(event.target.value),
        }, workspaces.map((row) => h('option', { key: row.id, value: row.path }, row.name))),
      ) : h('div', { className: 'svn-workspace-picker', role: 'status' }, message),
      workspacePath ? h(SvnApp, { key: workspacePath, api }) : null,
    )
  }

  const label = () => t('SVN 管理面板')
  ctx.ui.registerCenterTab({ key: 'svn', title: label, component: WorkspacePanel })
  ctx.ui.registerSidebarNav({
    key: 'svn',
    label,
    onOpen: () => ctx.ui.openCenterTab('svn'),
  })
}
