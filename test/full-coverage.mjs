import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, mkdirSync, rmSync, chmodSync, cpSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import React from 'react'

const out = process.env.CCGUI_QA_OUTPUT ? pathToFileURL(process.env.CCGUI_QA_OUTPUT.replace(/\/?$/, '/')) : new URL('../validation/2026-11-19-full-regression/', import.meta.url)
const records = []
const dom = new JSDOM('<div></div>')
globalThis.DOMParser = dom.window.DOMParser
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8')
const marker = "  const label = () => t('SVN 管理面板')"
assert.ok(source.includes(marker))
const exposed = source.replace(marker, '  ctx.qa = { makeApi, localPath, relativePath, pathKey, copyText, parseDiff, operations, countConflicts };\n' + marker)
const temp = realpathSync(mkdtempSync(join(tmpdir(), 'ccgui-full-')))
writeFileSync(join(temp, 'entry.mjs'), exposed)
const { default: activate } = await import(pathToFileURL(join(temp, 'entry.mjs')))
const run = (bin, args, env = {}) => execFileSync(bin, args, { env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
let sequence = 0
async function check(env, module, title, steps, expected, fn) {
  const record = { id: `QA-${String(++sequence).padStart(3, '0')}`, module, title, precondition: '独立临时本地 SVN 仓库；0.2.0 原始入口；未修改产品代码', steps, expected, environment: env, status: '通过', actual: '' }
  try { const detail = await fn(); record.actual = detail || '断言全部通过' }
  catch (error) { record.status = '失败'; record.actual = error.stack || String(error) }
  records.push(record)
  writeFileSync(new URL('cases.json', out), JSON.stringify(records, null, 2))
  console.log(record.id, env, record.status, title, record.status === '失败' ? record.actual : '')
}

try {
for (const simulation of [false, true]) {
  const env = simulation ? 'Windows 模拟：路径/CRLF/错误注入；SVN 后端为 macOS' : 'macOS 真实 SVN/文件系统；API 使用 SDK 测试适配器'
  const base = join(temp, simulation ? 'win' : 'mac'); mkdirSync(base)
  const real = base + '/wc'; const peer = base + '/peer'; const wc = simulation ? 'C:\\回归 空格\\wc' : real
  const url = pathToFileURL(base + '/repo').href
  run('svnadmin', ['create', base + '/repo'])
  run('svn', ['mkdir', '-qm', 'layout', url + '/trunk', url + '/branches'])
  let fault = null; let registered = null; const calls = []
  const convert = value => {
    if (!simulation) return value
    const normalized = value.replace(/\\/g, '/')
    const prefix = wc.replace(/\\/g, '/')
    if (normalized.toLowerCase().startsWith(prefix.toLowerCase())) return real + normalized.slice(prefix.length)
    return value === 'NUL' ? '/dev/null' : value
  }
  const ctx = { react: React, theme: { injectCss(css) { assert.match(css, /\.dark/); } }, i18n: { addBundle() {} }, host: { locale: 'zh-CN' }, ui: { registerCenterTab() {}, registerSidebarNav() {} }, workspaces: { async add(p) { registered = p } }, bridge: { async invoke(action, options) {
    assert.equal(action, 'plugin_exec_run'); calls.push(options)
    if (fault) return fault(options)
    try {
      let stdout = run(options.bin, options.args.map(convert), options.env)
      if (simulation) stdout = stdout.replaceAll(real, wc).replace(/path="(C:[^"]*)"/g, (_, p) => 'path="' + p.replace(/\//g, '\\') + '"').replace(/\r?\n/g, '\r\n')
      return { code: 0, stdout, stderr: '' }
    } catch (e) { return { code: e.status ?? 1, stdout: String(e.stdout || ''), stderr: String(e.stderr || '') } }
  } } }
  activate(ctx); const api = ctx.qa.makeApi(wc); const opts = extra => ({ wc, ...extra })
  const c = (module, title, steps, expected, fn) => check(env, module, title, steps, expected, fn)
  await c('检出/工作区', '检出并登记工作区', '调用 /checkout，读取 /state', '检出成功、登记原始路径、元数据路径一致', async () => {
    await api('/checkout', { url: url + '/trunk', directory: wc }); assert.equal(registered, wc)
    assert.equal((await api('/state')).workingCopies[0].path, wc)
  })
  await c('检出/异常', '拒绝无效目标、凭据 URL 与修订', '分别传入相对目录、含凭据 URL、无效修订', '均拒绝，未执行 SVN 写入', async () => {
    for (const extra of [{ directory: 'relative' }, { url: 'https://user:pass@example.test/repo' }, { revision: '-1' }]) await assert.rejects(api('/checkout', { url: url + '/trunk', directory: wc, ...extra }))
  })
  await c('纳入/提交', '中文空格与 @ 文件真实提交', '创建 a.txt、中文 空格@.txt 与目录子项；纳入并提交', '仓库内容一致', async () => {
    mkdirSync(real + '/dir'); for (const name of ['a.txt', '中文 空格@.txt', 'dir/child.txt']) writeFileSync(real + '/' + name, 'base\n')
    await api('/add', opts({ paths: ['a.txt', '中文 空格@.txt', 'dir'] })); await api('/commit', opts({ paths: ['a.txt', '中文 空格@.txt', 'dir', 'dir/child.txt'], message: '初始提交' }))
    assert.equal(run('svn', ['cat', url + '/trunk/a.txt']), 'base\n')
  })
  await c('差异/提交隔离', '仅提交所选文件', '修改两个文件，查看差异，只提交 a.txt', '另一个文件仍保留本地修改，仓库不变', async () => {
    writeFileSync(real + '/a.txt', 'selected\n'); writeFileSync(real + '/中文 空格@.txt', 'unselected\n')
    assert.match((await api('/diff', opts({ path: 'a.txt' }))).diff, /selected/)
    await api('/commit', opts({ paths: ['a.txt'], message: 'selected only' }))
    assert.equal(run('svn', ['cat', url + '/trunk/' + encodeURIComponent('中文 空格@.txt') + '@']), 'base\n')
    await api('/revert', opts({ paths: ['中文 空格@.txt'] }))
  })
  await c('服务器对比/更新', '远端变更查询不写本地；更新后写入', 'peer 提交 a.txt；status remote；update', '远端状态可见；查询不改内容；更新拉取内容', async () => {
    run('svn', ['checkout', '-q', url + '/trunk', peer]); writeFileSync(peer + '/a.txt', 'remote\n'); run('svn', ['commit', '-qm', 'peer', peer])
    const result = await api('/status', opts({ remote: true })); assert.ok(result.entries.some(e => e.path === 'a.txt' && e.reposStatus?.item === 'modified'))
    assert.equal(readFileSync(real + '/a.txt', 'utf8'), 'selected\n'); await api('/update', opts()); assert.equal(readFileSync(real + '/a.txt', 'utf8'), 'remote\n')
  })
  await c('属性', '属性读写、删除与提交', '设置 custom:qa；读取；提交；删除；还原', '值及状态正确，属性名校验生效', async () => {
    await api('/property-set', opts({ path: 'a.txt', name: 'custom:qa', value: '中文\nvalue' }))
    assert.ok((await api('/properties', opts({ path: 'a.txt' }))).some(p => p.name === 'custom:qa' && p.value.replace(/\r\n/g, '\n') === '中文\nvalue'))
    await api('/commit', opts({ paths: ['a.txt'], message: 'property' })); await api('/property-delete', opts({ path: 'a.txt', name: 'custom:qa' })); await api('/revert', opts({ paths: ['a.txt'] }))
    await assert.rejects(api('/property-set', opts({ name: 'bad name' })))
  })
  await c('忽略规则', '保留旧规则、追加及去重、显示忽略项', '写入旧规则；创建 x[1].tmp；重复加入忽略；查询 status', '旧规则保留，新规则不重复，忽略状态正确', async () => {
    await api('/property-set', opts({ name: 'svn:ignore', value: 'old\r\n' })); writeFileSync(real + '/x[1].tmp', 'ignored')
    await api('/ignore', opts({ path: 'x[1].tmp' })); await api('/ignore', opts({ path: 'x[1].tmp' })).catch(e => { assert.match(e.message, /尚未|unversioned/) })
    const prop = (await api('/properties', opts())).find(p => p.name === 'svn:ignore'); assert.match(prop.value, /old/)
    assert.equal((prop.value.match(/x/g) || []).length, 1)
    assert.ok((await api('/status', opts({ ignored: true }))).entries.some(e => e.path === 'x[1].tmp' && e.item === 'ignored'))
    rmSync(real + '/x[1].tmp'); await api('/revert', opts({ paths: ['.'] }))
  })
  await c('文件锁', '查询、加锁、拒绝重复加锁、解锁', '对 a.txt 加锁；重复锁定；查询 token；解锁', '持有锁可解锁，重复加锁拒绝', async () => {
    await api('/lock', opts({ path: 'a.txt' })); assert.equal((await api('/lock-info', opts({ path: 'a.txt' }))).canUnlock, true)
    await assert.rejects(api('/lock', opts({ path: 'a.txt' }))); await api('/unlock', opts({ path: 'a.txt' })); await assert.rejects(api('/unlock', opts({ path: 'a.txt' })))
  })
  await c('历史/分页', '20 条分页及作者、关键词、路径、日期过滤', '创建 22 次修订，读取首页及更早页，逐项过滤', '分页无重叠，各过滤条件符合预期', async () => {
    for (let i = 0; i < 22; i++) { writeFileSync(real + '/a.txt', `history ${i}\n`); run('svn', ['commit', '-qm', `qa-page-${i}`, real + '/a.txt']) }
    await api('/state'); const page = await api('/log', opts()); assert.equal(page.entries.length, 20); assert.equal(page.hasMore, true)
    const older = await api('/log', opts({ beforeRev: page.nextBefore })); assert.ok(older.entries.every(e => e.revision < page.nextBefore))
    const author = page.entries[0].author; assert.ok((await api('/log', opts({ author }))).entries.every(e => e.author === author))
    assert.equal((await api('/log', opts({ keyword: 'no-such-message' }))).entries.length, 0)
    assert.ok((await api('/log', opts({ keyword: 'qa-page-', path: 'a.txt' }))).entries.length)
    assert.equal((await api('/log', opts({ from: '2999-01-01' }))).entries.length, 0); assert.equal((await api('/log', opts({ to: '1900-01-01' }))).entries.length, 0)
  })
  await c('历史详情/修订差异/溯源', '读取改动路径、整版和仓库文件差异、逐行溯源', '对最新修订读取详情、两类差异、blame', '路径、差异和行修订一致', async () => {
    const rev = (await api('/log', opts())).entries[0].revision
    assert.ok((await api('/log-detail', opts({ revision: rev }))).paths.some(p => p.path.endsWith('/a.txt')))
    assert.match((await api('/diff', opts({ revision: rev }))).diff, /history/)
    assert.match((await api('/diff', opts({ revision: rev, path: '/trunk/a.txt' }))).diff, /history/)
    assert.ok((await api('/blame', opts({ path: 'a.txt', revision: rev }))).lines.some(l => l.revision === rev))
    await assert.rejects(api('/log-detail', opts({ revision: 0 })))
  })
  await c('分支/标签/切换', '创建、重复检查、脏工作区拒绝、干净切换', 'copy 分支；重复 copy；制造本地修改后 switch；还原后切换', '重复和脏切换拒绝，干净切换成功', async () => {
    await api('/copy', opts({ source: '^/trunk', destination: '^/branches/qa@tag', message: 'branch' }))
    await assert.rejects(api('/copy', opts({ source: '^/trunk', destination: '^/branches/qa@tag', message: 'duplicate' })))
    writeFileSync(real + '/a.txt', 'dirty'); await assert.rejects(api('/switch', opts({ destination: '^/branches/qa@tag' })))
    await api('/revert', opts({ paths: ['a.txt'] })); await api('/switch', opts({ destination: '^/branches/qa@tag' })); await api('/state'); await api('/switch', opts({ destination: '^/trunk' })); await api('/state')
  })
  await c('合并', '预演不修改，正式合并写入，脏工作区保护', '分支 peer 提交；dry-run；正式 merge；还原', '预演不写入，实际合并生效，重复脏合并拒绝', async () => {
    const bp = base + '/branch'; run('svn', ['checkout', '-q', url + '/branches/qa@tag@', bp])
    const before = Number(run('svn', ['info', '--show-item', 'revision', url])); writeFileSync(bp + '/a.txt', 'merged\n'); run('svn', ['commit', '-qm', 'merge edit', bp]); const after = Number(run('svn', ['info', '--show-item', 'revision', url])); const range = `${before}:${after}`
    const old = readFileSync(real + '/a.txt', 'utf8'); await api('/update', opts()); await api('/merge', opts({ source: '^/branches/qa@tag', range, dryRun: true })); assert.equal(readFileSync(real + '/a.txt', 'utf8'), old)
    await api('/merge', opts({ source: '^/branches/qa@tag', range, dryRun: false })); assert.equal(readFileSync(real + '/a.txt', 'utf8'), 'merged\n'); await assert.rejects(api('/merge', opts({ source: '^/branches/qa@tag', range, dryRun: false }))); await api('/revert', opts({ paths: ['a.txt', '.'] }))
  })
  await c('冲突/传入差异/解决', '真实文本冲突及传入版本比较', 'peer 和本地同时改 a.txt；update；读取 conflict 与 incoming；theirs-full 解决', '检测冲突，传入差异存在，解决后状态恢复', async () => {
    run('svn', ['update', '-q', peer]); writeFileSync(peer + '/a.txt', 'incoming\n'); run('svn', ['commit', '-qm', 'incoming', peer]); writeFileSync(real + '/a.txt', 'mine\n'); await api('/update', opts())
    assert.ok((await api('/status', opts())).entries.some(e => e.item === 'conflicted'))
    assert.ok((await api('/conflict', opts({ path: 'a.txt' }))).length); assert.match((await api('/conflict-incoming', opts({ path: 'a.txt' }))).diff, /incoming/)
    await api('/resolve', opts({ paths: ['a.txt'], accept: 'theirs-full' })); assert.equal(readFileSync(real + '/a.txt', 'utf8'), 'incoming\n')
  })
  for (const kind of ['property', 'tree']) await c('冲突', `真实${kind}冲突与 working 解决`, '在 peer 和本地制造属性冲突或删除/修改树冲突，更新后读取并解决', '冲突类型标记与详情正确，working 解决可执行', async () => {
    run('svn', ['update', '-q', peer]); await api('/update', opts())
    if (kind === 'property') { run('svn', ['propset', 'custom:conflict', 'remote', peer + '/a.txt']); run('svn', ['commit', '-qm', 'property conflict', peer]); await api('/property-set', opts({ path: 'a.txt', name: 'custom:conflict', value: 'local' })) }
    else { writeFileSync(peer + '/a.txt', 'tree incoming\n'); run('svn', ['commit', '-qm', 'tree conflict', peer]); await api('/delete', opts({ paths: ['a.txt'] })) }
    await api('/update', opts()); const status = await api('/status', opts()); assert.ok(status.entries.some(e => kind === 'property' ? e.props === 'conflicted' : e.treeConflicted))
    assert.ok((await api('/conflict', opts({ path: 'a.txt' }))).length); await api('/resolve', opts({ paths: ['a.txt'], accept: 'working' })); await api('/revert', opts({ paths: ['a.txt'] }))
  })
  await c('差异', '未纳入文件合成差异、二进制提示和 CRLF 解析', '创建未纳入文本读取合成差异；提交二进制后修改；解析 CRLF diff', '未纳入新增可见，二进制标识正确，CRLF 行可解析', async () => {
    writeFileSync(real + '/new.txt', 'new text\n'); assert.equal((await api('/diff', opts({ path: 'new.txt', unversioned: true }))).synthesized, true); rmSync(real + '/new.txt')
    writeFileSync(real + '/binary.dat', Buffer.from([0, 1, 255])); await api('/add', opts({ paths: ['binary.dat'] })); await api('/commit', opts({ paths: ['binary.dat'], message: 'binary' })); writeFileSync(real + '/binary.dat', Buffer.from([0, 2, 254])); assert.equal((await api('/diff', opts({ path: 'binary.dat' }))).binary, true); await api('/revert', opts({ paths: ['binary.dat'] }))
    assert.ok(ctx.qa.parseDiff('@@ -1 +1 @@\r\n-old\r\n+new\r\n').length)
  })
  await c('删除/清理', '目录删除提交与 svn cleanup', '删除 dir 并提交；cleanup；查询仓库', '目录已删除，cleanup 成功', async () => {
    await api('/delete', opts({ paths: ['dir'] })); await api('/commit', opts({ paths: ['dir'], message: 'delete directory' })); await api('/cleanup', opts()); assert.throws(() => run('svn', ['info', url + '/trunk/dir']))
  })
  await c('连接诊断', '真实本地仓库连接', '执行 /diagnose', '返回连接成功', async () => { assert.match((await api('/diagnose', opts())).output, /连接成功/) })
  for (const [title, error, pattern] of [['依赖缺失', 'ENOENT', /无法启动/], ['认证失败', 'E170001 authentication failed', /认证失败/], ['代理失败', 'proxy connection refused', /代理配置/], ['证书失败', 'E230001 certificate failed', /证书验证失败/], ['超时', 'timed out', /勿直接重试/], ['权限只读', 'EACCES Permission denied', /Permission denied/]]) await c('异常/外部依赖', title, '桥接注入对应失败；再恢复真实桥接', '错误可见且不会吞掉', async () => {
    fault = () => { throw new Error(error) }; try { await assert.rejects(api('/diagnose', opts()), pattern) } finally { fault = null }
  })
  await c('输出上限/日志', '64 KiB 拒绝、日志脱敏与 100 条上限', '注入大输出及 105 次含凭据错误', '拒绝不完整输出，日志不泄漏且有界', async () => {
    try { fault = () => ({ code: 0, stdout: 'x'.repeat(65536), stderr: '' }); await assert.rejects(api('/status', opts()), /64 KiB/)
      fault = () => { throw new Error('https://alice:password@private.test/repo token=secret') }; for (let i = 0; i < 105; i++) await assert.rejects(api('/diagnose', opts()))
      assert.equal(ctx.qa.operations.length, 100); assert.doesNotMatch(JSON.stringify(ctx.qa.operations), /alice|private.test|token=secret/)
    } finally { fault = null }
  })
  await c('路径校验', '相对路径越界、盘符、UNC、大小写与长路径字符串', '检查 localPath 和 relativePath；无选择写操作', '越界拒绝、边界匹配、Windows 等价键一致', async () => {
    for (const path of ['../a', 'C:foo']) assert.throws(() => ctx.qa.localPath(wc, path))
    assert.equal(ctx.qa.relativePath(wc, wc + '/a.txt'), 'a.txt'); assert.equal(ctx.qa.relativePath(wc, wc + '-other/a'), null)
    assert.equal(ctx.qa.relativePath('\\\\server\\share\\wc', '//SERVER/share/wc/a'), 'a')
    assert.ok(ctx.qa.localPath('C:/wc', 'a/'.repeat(150) + 'f').length > 260)
    await assert.rejects(api('/commit', opts({ paths: [] })))
  })
  await c('剪贴板', '现代接口及回退分支', '分别提供 writeText、拒绝的 writeText、无 clipboard；调用 copyText', '成功接口收到原文；回退执行 execCommand', async () => {
    globalThis.document = dom.window.document; let copied = ''; let fallback = 0
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async text => { copied = text } } } }); await ctx.qa.copyText('中文\r\n@'); assert.equal(copied, '中文\r\n@')
    document.execCommand = () => { fallback++; return true }; navigator.clipboard.writeText = async () => { throw new Error('denied') }; await ctx.qa.copyText('fallback'); assert.equal(fallback, 1)
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} }); await ctx.qa.copyText('legacy'); assert.equal(fallback, 2); assert.equal(document.querySelectorAll('textarea').length, 0)
  })
  await c('编码/换行/权限', simulation ? '模拟 UTF-16 路径、CRLF 与只读拒绝边界' : '真实中文 CRLF 文件及只读写入拒绝', '在临时文件写入中文 CRLF，改为只读后尝试写入', '内容字节一致；macOS 拒绝只读写入；模拟不等于 Windows ACL', async () => {
    const p = base + '/中文.txt'; writeFileSync(p, '中文\r\n@'); assert.equal(readFileSync(p, 'utf8'), '中文\r\n@')
    if (!simulation) { chmodSync(p, 0o444); try { assert.throws(() => writeFileSync(p, 'overwrite')) } finally { chmodSync(p, 0o644) } }
  })
  await c('安装/升级/卸载', '目录安装、同 ID 覆盖升级、清理', '复制 manifest/main；保留旧 ID 覆盖到 0.2.0；删除隔离安装目录', 'ID 不变、版本更新、清理完成；仅宿主模型', async () => {
    const dir = base + '/installed'; mkdirSync(dir); cpSync(new URL('../manifest.json', import.meta.url), dir + '/manifest.json'); cpSync(new URL('../main.js', import.meta.url), dir + '/main.js')
    const m = JSON.parse(readFileSync(dir + '/manifest.json')); const id = m.id; m.version = '0.1.9'; writeFileSync(dir + '/manifest.json', JSON.stringify(m)); cpSync(new URL('../manifest.json', import.meta.url), dir + '/manifest.json'); const upgraded = JSON.parse(readFileSync(dir + '/manifest.json')); assert.equal(upgraded.id, id); assert.equal(upgraded.version, '0.2.0'); rmSync(dir, { recursive: true }); assert.equal(existsSync(dir), false)
  })
  writeFileSync(new URL(simulation ? 'windows-command-trace.json' : 'macos-command-trace.json', out), JSON.stringify(calls, null, 2))
}
} finally { dom.window.close(); rmSync(temp, { recursive: true, force: true }) }
console.log('汇总', JSON.stringify(records.reduce((r, x) => (r[x.status] = (r[x.status] || 0) + 1, r), {})))
process.exitCode = records.some(r => r.status === '失败') ? 1 : 0
