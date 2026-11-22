import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
const dom = new JSDOM('<div/>'); globalThis.DOMParser = dom.window.DOMParser; globalThis.document = dom.window.document
const dir = mkdtempSync(join(tmpdir(), 'ccgui-edge-'))
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8')
writeFileSync(dir + '/entry.mjs', source.replace("  const label = () => t('SVN 管理面板')", "  ctx.qa = { makeApi, copyText, countConflicts };\n  const label = () => t('SVN 管理面板')"))
const { default: activate } = await import(pathToFileURL(dir + '/entry.mjs'))
const records = []
try {
for (const windows of [false, true]) {
 const environment = windows ? 'Windows 模拟/SDK 响应与错误注入' : 'macOS/SDK 响应与错误注入'
 const wc = windows ? 'C:\\qa' : '/qa'; const xml = `<info><entry revision="2" kind="dir"><url>file:///repo/trunk</url><repository><root>file:///repo</root></repository><relative-url>^/trunk</relative-url><wc-info><wcroot-abspath>${wc}</wcroot-abspath></wc-info></entry></info>`
 let reply = null; let held = null; const calls = []
 const ctx = { react: {}, host: { locale: 'zh-CN' }, i18n: { addBundle() {} }, theme: { injectCss() {} }, ui: { registerCenterTab() {}, registerSidebarNav() {} }, bridge: { async invoke(action, options) {
  calls.push(options); if (held && options.args[0] === 'cleanup') await held
  return reply ? reply(options) : { code: 0, stdout: options.args[0] === 'info' ? xml : '<status/>', stderr: '' }
 } } }; activate(ctx); const api = ctx.qa.makeApi(wc); await api('/state')
 async function c(title, steps, expected, fn) {
  const r = { id: `EDGE-${windows ? 'W' : 'M'}-${records.length + 1}`, module: '边界/异常', title, precondition: '0.2.0 入口；独立 SDK 响应夹具', steps, expected, environment, status: '通过', actual: '' }
  try { await fn(); r.actual = '断言全部通过' } catch (e) { r.status = '失败'; r.actual = e.stack }
  finally { reply = null; held = null }
  records.push(r)
 }
 await c('无效 XML 不当作成功数据', '注入畸形 status XML', '抛出解析错误', async () => { reply = () => ({ code: 0, stdout: '<broken>', stderr: '' }); await assert.rejects(api('/status', { wc })) })
 await c('溯源 5000 行上限', '注入 5001 行合法 blame', '保留 5000 行并标截断', async () => { reply = () => ({ code: 0, stdout: '1 u x\r\n'.repeat(5001), stderr: '' }); const r = await api('/blame', { wc, path: 'a' }); assert.equal(r.lines.length, 5000); assert.equal(r.truncated, true) })
 await c('非法溯源格式拒绝', '注入无法识别的 blame 文本', '显示无法解析错误', async () => { reply = () => ({ code: 0, stdout: 'not blame', stderr: '' }); await assert.rejects(api('/blame', { wc, path: 'a' }), /无法解析/) })
 await c('二进制属性编码标识', '注入 base64 属性 XML', '保留编码标记而不冒充文本', async () => { reply = () => ({ code: 0, stdout: '<properties><property name="binary" encoding="base64">AAE=</property></properties>', stderr: '' }); assert.equal((await api('/properties', { wc }))[0].encoding, 'base64') })
 await c('属性和树冲突汇总', '注入正常文件属性冲突和树冲突 status XML', '两者均计为冲突及本地修改', async () => {
  reply = () => ({ code: 0, stdout: `<status><entry path="${wc}/a"><wc-status item="normal" props="conflicted"/></entry><entry path="${wc}/b"><wc-status item="normal" props="none" tree-conflicted="true"/></entry></status>`, stderr: '' })
  const r = await api('/status', { wc }); assert.equal(r.summary.conflicted, 2); assert.equal(r.summary.total, 2)
 })
 await c('仅属性修改计为本地变更', '注入 item=normal props=modified', '总计与属性计数均为 1', async () => { reply = () => ({ code: 0, stdout: `<status><entry path="${wc}/a"><wc-status item="normal" props="modified"/></entry></status>`, stderr: '' }); const r = await api('/status', { wc }); assert.equal(r.summary.props, 1); assert.equal(r.summary.total, 1) })
 await c('无文本来源的传入差异拒绝', 'info XML 不含 text conflict 来源', '抛出无可对比文件版本', async () => { await assert.rejects(api('/conflict-incoming', { wc, path: 'a' }), /没有可对比/) })
 await c('参数边界与命令超时配置', '提交说明包含引号、换行、@、Shell 字符；调用 commit', '保持为单独参数，bin=svn，写操作超时 300 秒', async () => { const message = '中文 "引号"\n@ & $()'; reply = () => ({ code: 0, stdout: 'Committed revision 3.', stderr: '' }); await api('/commit', { wc, paths: ['a'], message }); const call = calls.at(-1); assert.equal(call.bin, 'svn'); assert.ok(call.args.includes(message)); assert.equal(call.timeoutMs, 300000); assert.equal(call.env.LC_ALL, 'en_US.UTF-8') })
 await c('写操作互斥与失败后解锁', '挂起 cleanup，发起第二次 cleanup，再释放', '第二次拒绝，释放后允许再次调用', async () => { let release; held = new Promise(r => { release = r }); const pending = api('/cleanup', { wc }); await assert.rejects(api('/cleanup', { wc }), /正在执行/); release(); await pending; held = null; await api('/cleanup', { wc }) })
 await c('文本/属性/树冲突数量解析', '解析混合 CRLF 冲突汇总', '计数合计 6', async () => { assert.equal(ctx.qa.countConflicts('Text conflicts: 1\r\nProperty conflicts: 2\r\nTree conflicts: 3'), 6) })
 await c('空格 @ 与中文命令保持原参数', '调用 checkout，捕获参数数组', '原目录保持不变；Windows 命令目标以 / 结尾，不添加 @', async () => {
  const directory = windows ? 'C:\\中文\\space @wc' : '/中文/space @wc'; let registered; ctx.workspaces = { async add(path) { registered = path } }; reply = () => ({ code: 0, stdout: '', stderr: '' }); await api('/checkout', { url: 'file:///repo/trunk', directory }); assert.equal(calls.at(-1).args.at(-1), windows ? directory.replace(/\\/g, '/') + '/' : directory); assert.equal(registered, directory)
 })
 await c('剪贴板所有写入方式失败应可观测', '现代接口拒绝；execCommand 返回 false；调用复制', '复制失败应返回失败或拒绝，不能成功完成', async () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { async writeText() { throw new Error('denied') } } } }); document.execCommand = () => false
  await assert.rejects(ctx.qa.copyText('copy cannot succeed'))
 })
}
} finally { dom.window.close(); rmSync(dir, { recursive: true, force: true }) }
writeFileSync(process.env.CCGUI_QA_OUTPUT ? join(process.env.CCGUI_QA_OUTPUT, 'edge-cases.json') : new URL('../validation/2026-11-19-full-regression/edge-cases.json', import.meta.url), JSON.stringify(records, null, 2))
console.log(JSON.stringify(records.filter(r => r.status === '失败'), null, 2));console.log('边界结果', records.length, '失败', records.filter(r => r.status === '失败').length)
process.exitCode = records.some(r => r.status === '失败') ? 1 : 0
