# 缺陷修复与验证记录

日期：2026-11-19。范围依据上一轮报告的 D-01、D-02、L-01、L-02、E-01，按该顺序处理。原报告、引用、路径、URL 和代码块保留；本记录为增量结果。原 12 项未覆盖是验证缺口，不擅自扩展为 12 个产品缺陷，也不因本次局部修复自动关闭。

修复代码位于 `compat/fixes-20261119`，最终产品验证提交 `467fc085b74e53e29272a664b0038f2f10625f3f`。当前已发布 0.2.0 不会自动包含该分支修复；本轮没有合并、改版本号或重新发布。

## D-01：剪贴板全部写入方式失败时无反馈

- **问题描述**：现代 writeText 拒绝且回退 execCommand 返回 false 时，copyText 仍正常完成；回退抛异常还可能遗留临时 textarea。影响复制版本、差异及脱敏操作记录。
- **复现/定位**：修复前执行 `node test/edge-coverage.mjs`，EDGE-M-12 和 EDGE-W-24 均出现 `Missing expected rejection`。三个复制调用点均没有失败处理。
- **修复方案**：检查回退返回值；失败由 Promise 拒绝；finally 删除临时输入框。三个入口统一使用 CopyButton 显示可访问的失败提示，重试清除旧提示，成功路径不新增提示。
- **修改文件或位置**：`main.js` 的 copyText/fallbackCopy、CopyButton、中英错误文案、CommitDetail/DiffView/AdvancedDialog 三个调用点；`test/clipboard-fix.mjs`；`test/package.json` 将新用例纳入默认回归。
- **验证步骤**：现代复制成功、拒绝后回退成功、两者失败、回退抛异常、无现代接口、临时节点清理、三个界面入口、重试成功清除错误、中英提示；再执行原有回归。
- **验证命令**：`node --test test/clipboard-fix.mjs`、`node test/edge-coverage.mjs`、`npm test --prefix test`。
- **验证结果：通过**。边界 24/24；专用 UI 用例通过；最终双平台 CI 两轮均包含该用例并通过。UI 错误注入为 JSDOM/React，未在真实宿主中强制改变系统剪贴板权限。
- **证据**：`validation/2026-11-19-fixes/D-01-ui.log`、`final-edge.log`、`final-ci.log`。
- **遗留风险**：原生系统剪贴板策略、所有 DPI/窄窗口的错误文案排版仍属于原报告的系统/视觉补测，不据组件测试宣称已全部验证。

## D-02：详情中的 README 版本及支持范围陈旧

- **问题描述**：清单为 0.2.0，README 仍写当前版本 0.1.9 及仅 Windows 11，与当前交付范围矛盾。
- **复现/定位**：读取当前 manifest/README，与上一轮原生详情观察一致。
- **修复方案**：最小方案是只修正 README 对应版本及兼容边界文案，保留链接和代码块；但此前用户明确要求「不要改 readme」，本轮没有明确撤销该约束。
- **修改文件或位置**：**未改 README 或宿主渲染**。不通过修改插件界面、覆盖宿主 DOM 等方式掩盖文档问题。新增证据 `validation/2026-11-19-fixes/D-02-readme-proof.json`。
- **验证步骤**：比较 manifest.version 与正文；记录两个 README 的 SHA-256；结束时再次核对，并检查 `git diff --name-only -- README.md README.en.md`。
- **验证结果：阻塞**。问题已定位，受保留 README 的约束不能实施必要修改。
- **遗留风险/解除条件**：展示误导仍在；需明确允许修正相应文案，再核对真实详情页。不能标为已修复。

## L-01：Windows 中文命令行参数转换

- **问题描述**：SlikSVN 1.14.5 在既有 Windows 环境无法检出中文目录；此前缺少实际 exe、代码页及环境对照，不能把根因当作已定位。
- **复现/定位**：新增独立真实 Windows CI，使用绝对路径 `C:\Program Files\SlikSvn\bin\svn.exe`；记录二进制 SHA-256、Node 参数探针、ACP/控制台代码页、继承及插件环境、原始输出字节和实际目录枚举。
- **实测事实**：Windows Server 2025；PowerShell 7.6.9；ACP 1252；ConsoleCP/ConsoleOutputCP 65001。同机 Node 子进程完整收到 `中文目录` 与 `space @wc`；绝对路径 SlikSVN 在继承环境和 `LC_ALL=en_US.UTF-8` 两配置下均退出 1、E720123，目录未按原名创建。两批独立证据结果一致。
- **修复方案**：先补齐环境取证；修复旧扩展测试未透传 options.env 的测试缺口。产品必须保持原始 Unicode 参数，不做重复编码、改文件名、百分号替代或全局改系统代码页。
- **修改文件或位置**：`test/windows-defects.mjs`、`.github/workflows/windows-defects.yml`；`test/extended.mjs` 真实桥接合并继承环境并透传 options.env。**没有把测试透传修复当作中文功能已修复。**
- **验证步骤**：Windows CI 使用固定 SlikSVN 1.14.5；先断言 Node 子进程收参完整，再执行继承环境/插件环境的同名中文目录检出；检查返回码、stderr 原始十六进制、实际目录名。
- **验证命令**：在 Windows 设置 `CCGUI_SVN_EXE` 为已确认的绝对路径后执行 `node test/windows-defects.mjs`；CI 保存编码环境及 JSON 工件。
- **验证结果：阻塞**。故障复现明确，但当前单文件插件的 bin/args/env 桥接不能恢复客户端调用链已经替换的字符；内部具体转换点仍需客户端断点证据。没有经过本任务验证的可直接替换 Unicode 客户端，不能宣称升级某版本即可解决。
- **证据**：`validation/2026-11-19-fixes/windows-initial/`、`windows-final/` 中 windows-encoding.json 和 windows-defects.json。
- **遗留风险/解除条件**：需要可验证的 Unicode Windows SVN 构建，或宿主提供原生 Unicode SVN 能力；在隔离环境验证中文路径、文件名、提交说明、属性值与输出后才可关闭。控制台已为 65001 而故障仍在，不能把 chcp 65001 作为已证实修复。

## L-02：Windows 检出目录 @ 前空格丢失

- **问题描述**：请求 `space @wc`，Windows SVN 实际创建 `space@wc`。此前给目标追加 @ 的试验会创建 `space @wc@`，已经撤回，未重新采用。
- **复现/定位**：本轮绝对 exe 独立对照再次确认原参数创建错误目录；同一配置仅在检出目标末尾增加 `/` 后，准确创建 `space @wc`。源码中 peg 后缀拆分再规范化的路径与现象相符；未把未调试的客户端内部细节写成最终根因。
- **修复方案**：仅 Windows 格式的 checkout 目标参数统一分隔符并增加末尾 `/`，避免该检出参数进入错误的 @ 拆分路径。源仓库 URL、其他 SVN 命令及 macOS 检出参数不变，登记/返回的仍为原始 options.directory。
- **修改文件或位置**：`main.js` 的 `/checkout`、directoryTarget；`test/extended.mjs` 取消该项 TODO 并补充完整目录读写；`test/edge-coverage.mjs` 检查命令表示与登记原目录的区别。
- **验证步骤**：真实 SVN 分别检出 `space @wc`、`space  @wc`、`a@b @wc`、`name@`；读取 /state，在原目录创建 probe.txt，纳入、提交、读取、删除并提交；macOS 执行同组回归；Windows 执行两轮，不能以退出码 0 代替目录名与后续操作检查。
- **验证命令**：`npm test --prefix test`、`node test/edge-coverage.mjs`；独立 Windows 对照见 Windows defect proof 工作流。
- **验证结果：通过**。macOS 本地 8/8；最终 CI macOS 两轮各 8 通过，Windows 两轮各 7 通过、1 TODO 实测失败。L-02 为普通通过用例，剩余 TODO 是 L-01 中文故障，未计为通过。
- **证据**：[最终双平台 CI](https://github.com/sheldon0112/plugin-svn/actions/runs/44547535303)、`L-02-macos-regression.log`、`L-02-edge.log`、`final-ci.log`、独立 Windows 对照 JSON。
- **遗留风险**：真实 UNC 共享、长路径与 NTFS ACL 等仍按原未覆盖项补测；不据目录后缀修复承诺这些系统场景已认证。

## E-01：市场仍显示 0.1.8

- **问题描述**：0.2.0 Release 已存在，但上游市场主分支仍登记 0.1.8，市场安装/自动升级链路没有闭环。
- **复现/定位**：本轮读取上游 `plugins/ccgui-svn.json`、PR #131 状态及账号仓库权限。索引版本为 0.1.8；原 PR 校验通过但未合并；当前账号 push/maintain/admin 均为 false。
- **修复方案**：核验并重新触发现有版本登记 PR 的 CI，不改索引内容、附件哈希或发布地址。作者 fork 创建同树提交，保留单文件版本登记差异；不绕过上游审核流程。
- **修改文件或位置**：个人 fork 的 PR 分支新增同树提交 `a63f489492e585ce583a4271b890337529d23fa5`；无文件内容变化；主产品与已发布附件均未更改。
- **验证步骤**：检查 PR #131 新 head 的校验、自动审核任务和上游索引；结果记录在 E-01-market-proof.json、E-01-revalidation.json 及最终市场快照。
- **验证结果：阻塞**。重新触发的 validate（44548340988）通过；自动审核（44548419080）再次 skipped；PR 仍 OPEN、merged_at 为空，上游索引仍 0.1.8。不是本地缓存问题，不能标为市场更新成功。
- **遗留风险/解除条件**：若自动审核仍跳过，需上游维护者合并 [PR #131](https://github.com/zhukunpenglinyutong/ccgui-plugins/pull/131)；之后刷新市场索引，再验证新装/升级。当前账号不能自行合并上游 PR。

## 全部修改后的回归与总体结论

- 本地默认套件 8/8，24 项边界检查通过，补充全量服务测试 58/58（macOS 真实 SVN 后端＋Windows 路径/CRLF 模拟）；模拟边界与原回归报告一致。
- 最终真实 macOS/Windows CI 两轮结果如上；窗口系统剪贴板策略和所有视觉组合不等于已实测。
- 本地主入口与最终 CI 提交逐字节一致，SHA-256 `74e607f224a7589b4ff3539a06dfa50cce386b8d35285309ce8c62a34a4cbc12`。相对已发布 0.2.0 的产品改动仅限 D-01 和 L-02，差异保存在 `validation/2026-11-19-fixes/product.diff`。
- D-01、L-02 已完成代码与当前验证范围的闭环。D-02、L-01、E-01 阻塞。原 12 项未覆盖未整体重新执行，不能宣称全覆盖无条件可发布。
- 原历史报告不回写为通过，新日志写入独立 fixes 目录，保留问题从失败到通过的证据。

## 2026-11-22 增量（0.2.2 分支核实轮）：D-02 解除、L-01 属性值修复

- **核实方式**：按两轮独立复查协议在真实 Windows（10.0.26300 x64 + TortoiseSVN 1.14.2 + Node 22）执行。第一轮 CI 标准套件 7 通过 1 TODO 0 失败；full-coverage 42 通过 16 失败；edge-coverage 24/24；windows-defects 与已知状态一致。第二轮在新隔离目录复跑交叉验证。
- **D-02（README 版本矛盾）解除**：约束经用户本轮明确解除。README.md / README.en.md 版本号 `0.1.9`→`0.2.1`，兼容范围文案改为已实测环境（Windows 11 真机 + macOS CI），交付说明链接指向 release-0.2.1.md；其余结构、链接与代码块未动。
- **L-01 收窄与修复**：探针定位缺陷精确边界——Windows 宿主 W→A 系统代码页转换后，客户端把**属性值**字节原样入库（GBK 乱码），而路径参数（目录检出）、提交信息（`-m`）、lock 均实测无损。main.js 新增 `propsetValue`：直接写入→proplist 回读校验→GBK 替身换算写入→再校验→仍失败则恢复原值（或清理新属性）并显式报错，杜绝静默乱码。`/property-set` 与 `/ignore` 两处 propset 调用点接入。
- **2026-11-23 增量核实（①②③风险逐项验证）**：
  - **① 写入边界（已测明，维持显式报错）**：写入成功 ⇔ 值的 UTF-8 字节串整体是合法 cp936 字节序列（回读校验裁决，不依赖理论推导）。实测：`一`（e4b880，恰为合法序列）成功；`三中文`（悬空前导字节 0x87）失败；`中a文`（ASCII 被 cp936 解码吞作尾字节）失败；`中文\n消息`、`中文\r\n消息`、`中文忽略\n`、`🎉`、`中文🎉` 成功；纯 ASCII 恒成功。另发现并修复 helper 健壮性缺口：宿主代码页最适映射可能破坏参数结构（`🎉` 直传触发 E205001），现为每变体 try/catch 继续尝试。**不可修复原因**：W→A 转换发生在 svn.exe CRT 启动期、先于任何 svn 选项；`--file` 需要插件沙箱没有的文件写入能力（权限仅 exec:svn，见 docs/platform-compatibility.md）；`--encoding` 无法修复已被转换的字节。显式报错语义保持不变。
  - **② SlikSVN/CI（前提证伪并修正）**：本地解包 SlikSVN 1.14.5（msiexec /a 提取，未安装）真实复现：zh-CN ACP(936) 宿主上直传属性值同样 GBK 损坏、**替身换算同样有效**，含中文目录检出、中文提交信息全部正常；PATH 前置 SlikSVN 复刻 CI 跑标准套件 = 9 用例 8 通过 0 跳过 1 TODO，L-01 修复用例**直接通过而非跳过**。此前「SlikSVN 丢失中文参数」的归因修正为**宿主系统 ACP**：en-US runner（ACP 1252）无法映射中文，直传与替身都失败 → 插件显式报错 → 回归用例跳过（跳过逻辑已实测演示：报错→`# SKIP` 带原因）。L-01 命令行 TODO 原文保留，未删改。替代方案评估：`--file`（无文件写权限，不可用）、事后改写（存储字节同样要走 argv，不可用）、LC_ALL 环境升级（windows-defects L-01-plugin-env 案例证明无效）——替身换算是沙箱内唯一可行方案。
  - **③ 长路径/UNC/NTFS ACL（真实环境取证，登记不修复）**：新增 `windows-defects.mjs` 环境探针（记录型，无通过性断言）：本机 `LongPathsEnabled=0` 且 826 字符路径检出成功（TortoiseSVN 二进制自带长路径感知，风险低于预期，残留依赖各客户端 manifest）；`\\localhost\C$` 管理共享检出成功（真实网络共享的认证/离线场景超出本机范围）；NTFS ACL：文件级 deny-write 下 revert 走删除重建依然成功，`.svn` 目录 (OI)(CI) 拒写下 commit 以 E720005 干净失败——插件按既有错误通道呈现，无崩溃无静默。三项行为均正确，无需产品修复。
- **装置修复（非产品缺陷）**：full-coverage 安装升级用例的版本断言由硬编码 `0.2.0` 改为动态读 manifest.json——0.2.1 bump 后断言过期导致 QA-029/QA-058 假失败。
- **验证**：证据见 `validation/2026-11-22-verify-l01-d02/`（两轮套件日志、cases.json、探针记录、修复后回归、SlikSVN 对照运行）。
