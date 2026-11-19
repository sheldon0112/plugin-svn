import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import React from 'react'
const dom = new JSDOM('<div id="app"></div>')
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const dir = mkdtempSync(join(tmpdir(), 'ccgui-copy-fix-'))
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8').replace("  const label = () => t('SVN 管理面板')", "  ctx.qa = { copyText, CommitDetail, DiffView, AdvancedDialog };\n  const label = () => t('SVN 管理面板')")
writeFileSync(dir + '/entry.mjs', source)
const { default: activate } = await import(pathToFileURL(dir + '/entry.mjs'))
const ctx = { react: React, host: { locale: 'zh-CN' }, i18n: { addBundle() {} }, theme: { injectCss() {} }, ui: { registerCenterTab() {}, registerSidebarNav() {} } }
activate(ctx)
const root = createRoot(document.getElementById('app'))
const navigatorValue = value => Object.defineProperty(globalThis, 'navigator', { configurable: true, value })

test('D-01：三个复制入口显示失败，重试清除错误；中英提示', async () => {
 try {
  const cases = [
   [ctx.qa.CommitDetail, { entry: { revision: 8, paths: [] } }, '复制版本'],
   [ctx.qa.DiffView, { diff: { title: 'qa', data: { diff: '中文\r\n@' } } }, '复制差异'],
   [ctx.qa.AdvancedDialog, { api: async () => ({}), onClose() {} }, '复制脱敏操作记录'],
  ]
  for (const [Component, props, label] of cases) {
   navigatorValue({ clipboard: { async writeText() { throw new Error('denied') } } }); document.execCommand = () => false
   await React.act(async () => root.render(React.createElement(Component, { ...props, key: label })))
   const button = [...document.querySelectorAll('button')].find(b => b.textContent === label); assert.ok(button, label)
   await React.act(async () => button.click())
   assert.match(document.querySelector('[role="alert"]').textContent, /复制失败/)
   assert.equal(document.querySelectorAll('textarea').length, 0)
   let received
   navigatorValue({ clipboard: { async writeText(text) { received = text } } })
   await React.act(async () => button.click())
   assert.equal(document.querySelector('[role="alert"]'), null)
   assert.equal(typeof received, 'string')
  }
  ctx.host.locale = 'en'; navigatorValue({}); document.execCommand = () => false
  await React.act(async () => root.render(React.createElement(ctx.qa.DiffView, { key: 'en', diff: { data: { diff: 'x' } } })))
  await React.act(async () => [...document.querySelectorAll('button')].find(b => b.textContent === 'Copy diff').click())
  assert.match(document.querySelector('[role="alert"]').textContent, /Copy failed/)
  for (const exec of [() => false, () => { throw new Error('copy unavailable') }]) {
   document.execCommand = exec; await assert.rejects(ctx.qa.copyText('x')); assert.equal(document.querySelectorAll('textarea').length, 0)
  }
  document.execCommand = () => true; await ctx.qa.copyText('正常回退'); assert.equal(document.querySelectorAll('textarea').length, 0)
 } finally {
  await React.act(async () => root.unmount()); dom.window.close(); rmSync(dir, { recursive: true, force: true })
 }
})
