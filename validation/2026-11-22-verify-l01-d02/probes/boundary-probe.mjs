// ① 奇数对齐写入边界枚举：经真实 main.js /property-set（含 propsetValue 回读校验）对 TortoiseSVN 执行。
// 运行条件：Windows + TortoiseSVN svn.exe 在 PATH。输出 JSON 到 stdout。
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../../../test/package.json', import.meta.url))
const { JSDOM } = require('jsdom')
const React = require('react')

const dom = new JSDOM('<div id="app"></div>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.DOMParser = dom.window.DOMParser
require('react-dom/client')

const source = readFileSync(new URL('../../../main.js', import.meta.url), 'utf8')
const marker = "  const label = () => t('SVN 管理面板')"
const exposed = source.replace(marker, '  ctx.qa = { makeApi };\n' + marker)
const temp = mkdtempSync(join(tmpdir(), 'ccgui-boundary-'))
writeFileSync(join(temp, 'entry.mjs'), exposed)
const { default: activate } = await import(pathToFileURL(join(temp, 'entry.mjs')))

const run = (args) => execFileSync('svn', args, { encoding: 'utf8' })
const svnOnPath = execFileSync('where', ['svn'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim()
const svnadmin = join(dirname(svnOnPath), 'svnadmin.exe')
execFileSync(svnadmin, ['create', join(temp, 'repo')])
const url = pathToFileURL(join(temp, 'repo')).href
run(['checkout', '-q', url, join(temp, 'wc')])
mkdirSync(join(temp, 'wc', 'dir'))
run(['add', join(temp, 'wc', 'dir')])
run(['commit', '-qm', 'init', join(temp, 'wc')])

const ctx = { react: React, theme: { injectCss() {} }, i18n: { addBundle() {} }, host: { locale: 'zh-CN' }, ui: { registerCenterTab() {}, registerSidebarNav() {} }, workspaces: { async add() {}, async list() { return [] } }, bridge: { async invoke(action, options) { assert.equal(action, 'plugin_exec_run'); try { const stdout = execFileSync('svn', options.args, { encoding: 'utf8', env: { ...process.env, ...options.env } }); return { code: 0, stdout, stderr: '' } } catch (e) { return { code: e.status ?? 1, stdout: String(e.stdout || ''), stderr: String(e.stderr || '') } } } } }
activate(ctx)
const wc = join(temp, 'wc')
const api = ctx.qa.makeApi(wc)

const cases = ['一', '双字', '三中文', '四个汉字', '中a文', '中文\n消息', '中文\r\n消息', '中文忽略\n', 'plain', '🎉', '中文🎉']
const results = []
for (const value of cases) {
  const name = 'custom:b' + results.length
  let outcome
  try {
    await api('/property-set', { wc, path: 'dir', name, value })
    const prop = (await api('/properties', { wc, path: 'dir' })).find(p => p.name === name)
    outcome = { result: 'ok', encoding: prop.encoding || 'plain', roundtrip: prop.value.replace(/\r\n/g, '\n') === value.replace(/\r\n/g, '\n') }
  } catch (error) {
    outcome = { result: 'error', explicit: /回读校验/.test(String(error.message)), message: String(error.message).slice(0, 60) }
  }
  results.push({ value: JSON.stringify(value), utf8Bytes: Buffer.from(value, 'utf8').length, ...outcome })
}
console.log(JSON.stringify(results, null, 1))
rmSync(temp, { recursive: true, force: true })
process.exit(0)
