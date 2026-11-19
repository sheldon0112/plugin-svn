import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { test, after } from 'node:test'
import { JSDOM } from 'jsdom'
import React from 'react'

const dom = new JSDOM('')
globalThis.DOMParser = dom.window.DOMParser
// Expose the real API factory only in the test copy of the self-contained entry.
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8').replace(
  "  const label = () => t('SVN 管理面板')", "  ctx.testApi = makeApi; ctx.testOperations = operations;\n  const label = () => t('SVN 管理面板')")
const temp = mkdtempSync(tmpdir() + '/ccgui-svn-extended-')
writeFileSync(temp + '/test-main.mjs', source)
const { default: activate } = await import(pathToFileURL(temp + '/test-main.mjs'))
after(() => { dom.window.close(); rmSync(temp, { recursive: true, force: true }) })
const run = (...args) => execFileSync('svn', args, { encoding: 'utf8' })
const calls = []
let failure
const ctx = {
  react: React, theme: { injectCss() {} }, i18n: { addBundle() {} }, host: { locale: 'zh-CN' },
  ui: { registerCenterTab() {}, registerSidebarNav() {} },
  workspaces: { async add(path) { calls.push({ registered: path }) } },
  bridge: { async invoke(action, options) {
    calls.push(options)
    assert.equal(action, 'plugin_exec_run')
    if (failure) return failure(options)
    try { return { code: 0, stdout: run(...options.args), stderr: '' } }
    catch (error) { return { code: error.status, stdout: String(error.stdout || ''), stderr: String(error.stderr || '') } }
  } },
}
activate(ctx)

test('真实仓库：检出、特殊路径、提交隔离、属性、忽略、分支、合并与锁', async () => {
  execFileSync('svnadmin', ['create', temp + '/repo'])
  const repo = pathToFileURL(temp + '/repo').href
  run('mkdir', '-m', 'layout', repo + '/trunk', repo + '/branches')
  const wc = temp + '/中文 空格@wc'
  const api = ctx.testApi(wc)
  await api('/checkout', { url: repo + '/trunk', directory: wc, revision: 'HEAD' })
  assert.ok(calls.some((item) => item.registered === wc))
  await api('/state')
  const ignoredName = process.platform === 'win32' ? 'x[1].tmp' : 'x[1]*?.tmp'
  const names = ['a@b.txt', '-选项.txt', '未选.txt', 'binary.dat']
  for (const name of names) writeFileSync(wc + '/' + name, name === 'binary.dat' ? Buffer.from([0, 1, 255]) : 'base\n')
  mkdirSync(wc + '/newdir')
  writeFileSync(wc + '/newdir/child', 'child\n')
  await api('/add', { wc, paths: [...names, 'newdir'] })
  // All parent and descendant paths are explicit under --depth empty.
  await api('/commit', { wc, paths: [...names, 'newdir', 'newdir/child'], message: 'real initial commit' })
  writeFileSync(wc + '/a@b.txt', 'changed\n')
  writeFileSync(wc + '/未选.txt', 'keep local\n')
  assert.match((await api('/diff', { wc, path: 'a@b.txt' })).diff, /changed/)
  await api('/commit', { wc, paths: ['a@b.txt'], message: 'selected only' })
  assert.equal(run('cat', repo + '/trunk/' + encodeURIComponent('未选.txt')), 'base\n')
  assert.equal(readFileSync(wc + '/未选.txt', 'utf8'), 'keep local\n')
  await api('/property-set', { wc, path: '.', name: 'svn:ignore', value: 'old\n' })
  writeFileSync(wc + '/' + ignoredName, 'ignore')
  await api('/ignore', { wc, path: ignoredName })
  assert.match((await api('/properties', { wc, path: '.' }))[0].value, /old/)
  assert.ok((await api('/status', { wc, ignored: true })).entries.some((item) => item.path === ignoredName && item.item === 'ignored'))
  await api('/property-set', { wc, path: '.', name: 'svn:ignore', value: 'old\n' })
  assert.ok((await api('/status', { wc, ignored: true })).entries.some((item) => item.path === ignoredName && item.item === 'unversioned'))
  await api('/property-set', { wc, path: '.', name: 'svn:ignore', value: '*.tmp\n' })
  assert.ok((await api('/status', { wc, ignored: true })).entries.some((item) => item.item === 'ignored'))
  await api('/property-delete', { wc, path: '.', name: 'svn:ignore' })
  await api('/revert', { wc, paths: ['未选.txt', '.'] })
  await api('/delete', { wc, paths: ['newdir'] })
  await api('/commit', { wc, paths: ['newdir'], message: 'delete directory' })
  assert.throws(() => run('info', repo + '/trunk/newdir'))
  await api('/property-set', { wc, path: 'a@b.txt', name: 'custom:test', value: '中文\n--value' })
  await api('/commit', { wc, paths: ['a@b.txt'], message: 'property' })
  assert.equal(run('propget', '--strict', 'custom:test', repo + '/trunk/a@b.txt@'), '中文\n--value')
  await api('/copy', { wc, source: '^/trunk', destination: '^/branches/test@tag', revision: 'HEAD', message: 'branch' })
  await assert.rejects(api('/copy', { wc, source: '^/trunk', destination: '^/branches/test@tag', message: 'duplicate' }))
  const peer = temp + '/peer'
  run('checkout', repo + '/branches/test@tag@', peer)
  const before = Number(run('info', '--show-item', 'revision', repo))
  writeFileSync(peer + '/a@b.txt', 'branch content\n')
  run('commit', '-m', 'branch edit', peer)
  const after = Number(run('info', '--show-item', 'revision', repo))
  const range = before + ':' + after
  await assert.rejects(api('/merge', { wc, source: '^/branches/test@tag', range, dryRun: true }), /不支持.*@/)
  const mergeWc = temp + '/merge-wc'
  run('checkout', repo + '/trunk', mergeWc)
  const mergeApi = ctx.testApi(mergeWc)
  await mergeApi('/state')
  await mergeApi('/update', { wc: mergeWc })
  await mergeApi('/merge', { wc: mergeWc, source: '^/branches/test@tag', range, dryRun: true })
  assert.equal(readFileSync(mergeWc + '/a@b.txt', 'utf8'), 'changed\n')
  await mergeApi('/merge', { wc: mergeWc, source: '^/branches/test@tag', range, dryRun: false })
  assert.equal(readFileSync(mergeWc + '/a@b.txt', 'utf8'), 'branch content\n')
  await mergeApi('/revert', { wc: mergeWc, paths: ['a@b.txt', '.'] })
  writeFileSync(wc + '/binary.dat', Buffer.from([0, 2, 254]))
  assert.equal((await api('/diff', { wc, path: 'binary.dat' })).binary, true)
  await api('/revert', { wc, paths: ['binary.dat'] })
  await api('/lock', { wc, path: 'binary.dat' })
  assert.equal((await api('/lock-info', { wc, path: 'binary.dat' })).canUnlock, true)
  await api('/unlock', { wc, path: 'binary.dat' })
  unlinkSync(wc + '/' + ignoredName)
  await api('/switch', { wc, destination: '^/branches/test@tag' })
  assert.equal(run('info', '--show-item', 'relative-url', wc + '@').trim(), '^/branches/test@tag')
  assert.ok(calls.filter((item) => item.args?.[0] === 'commit').every((item) => item.timeoutMs === 300000))
  assert.ok(calls.filter((item) => item.args?.[0] === 'info').every((item) => item.timeoutMs === 60000))
})

test('大输出、认证代理证书与超时错误；日志有界脱敏', async () => {
  const api = ctx.testApi(temp + '/中文 空格@wc')
  await api('/state')
  for (const route of ['/diff', '/status', '/log-detail']) {
    failure = () => ({ code: 0, stdout: 'a'.repeat(65536), stderr: '' })
    await assert.rejects(api(route, { wc: temp + '/中文 空格@wc', revision: 2 }), /64 KiB/)
  }
  failure = () => ({ code: 1, stdout: '', stderr: 'e'.repeat(65536) })
  await assert.rejects(api('/diagnose', { wc: temp }), /64 KiB/)
  for (const [input, expected] of [
    ['E170001 authentication failed', /认证失败/], ['proxy connection refused', /代理配置/],
    ['E170013 E230001 certificate failed', /证书验证失败/], ['timed out after 300000ms', /勿直接重试/],
  ]) {
    failure = () => { throw new Error(input + ' https://alice:password@private.example/repo password=secret token=abc') }
    await assert.rejects(api('/diagnose', { wc: temp }), expected)
  }
  for (let index = 0; index < 105; index++) await assert.rejects(api('/diagnose', { wc: temp }))
  assert.equal(ctx.testOperations.length, 100)
  const serialized = JSON.stringify(ctx.testOperations)
  assert.doesNotMatch(serialized, /alice|private\.example|password=secret|token=abc/)
  failure = undefined
})
