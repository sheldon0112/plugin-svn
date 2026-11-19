import assert from 'node:assert/strict'
import { execFile, execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import React from 'react'
import activate from '../main.js'

const dom = new JSDOM('<div id="app"></div>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.DOMParser = dom.window.DOMParser
const { createRoot } = await import('react-dom/client')
const run = promisify(execFile)
const svn = (...args) => execFileSync('svn', args, { encoding: 'utf8' })

test('面板选择、预览、提交、冲突处理与切换', async () => {
  const temp = realpathSync(mkdtempSync(tmpdir() + '/ccgui-svn-'))
  const wc = temp + '/wc'
  const peer = temp + '/peer'
  const repo = pathToFileURL(temp + '/repo').href
  const trunk = repo + '/trunk'
  const a = 'src/a.txt'
  const b = 'other.txt'
  const app = createRoot(document.getElementById('app'))
  let Panel
  let locale = 'zh-CN'
  let hold
  let simulatedCommit
  let failNextLog = false
  let failAfterRevert = false
  activate({
    react: React,
    theme: { injectCss() {} },
    i18n: { addBundle() {} },
    host: { get locale() { return locale } },
    ui: { registerCenterTab({ component }) { Panel = component }, registerSidebarNav() {} },
    workspaces: { list: async () => [{ id: 'wc', path: wc, name: 'Fixture' }] },
    bridge: { async invoke(_action, { bin, args, env }) {
      if (args[0] === 'revert' && failAfterRevert) {
        failAfterRevert = false
        await run(bin, args, { env: { ...process.env, ...env } })
        return { code: 1, stdout: '', stderr: '模拟部分完成后失败' }
      }
      if (args[0] === 'commit') {
        simulatedCommit = args
        return { code: 0, stdout: 'Committed revision 99.', stderr: '' }
      }
      if (args[0] === 'log' && failNextLog) {
        failNextLog = false
        return { code: 1, stdout: '', stderr: '模拟历史加载失败' }
      }
      const pending = hold && args[0] === hold.command && args.at(-1).includes(a) ? hold : null
      if (pending) await pending.release
      try {
        return { code: 0, ...await run(bin, args, { env: { ...process.env, ...env } }) }
      } catch (error) {
        return { code: error.code, stdout: error.stdout, stderr: error.stderr }
      } finally {
        pending?.finish()
      }
    } },
  })
  const waitFor = async (read, label) => {
    for (let retry = 0; retry < 200; retry++) {
      const result = read()
      if (result) return result
      await delay(25)
    }
    assert.fail((label || '等待界面超时') + ': ' + document.body.textContent.slice(-1000))
  }
  const rows = () => [...document.querySelectorAll('.svn-row')]
  const row = (path) => rows().find((node) => node.title.split('\n')[0] === path)
  const button = (label, scope = document) => [...scope.querySelectorAll('button')].find((node) =>
    [...node.childNodes].filter((child) => child.nodeType === 3).map((child) => child.textContent).join('').trim() === label && !node.disabled)
  const click = async (label, scope) => (await waitFor(() => button(label, scope), label)).click()
  const modal = () => document.querySelector('.svn-modal')
  const closed = () => waitFor(() => !modal())
  const input = (node, value) => {
    const prototype = Object.getPrototypeOf(node)
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(node, value)
    node.dispatchEvent(new window.Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  }
  const filter = (value) => input(document.querySelector('input[placeholder="过滤路径…"]'), value)
  const menu = async (path, label) => {
    const node = await waitFor(() => !document.querySelector('.svn-list .svn-loading') && row(path), path)
    node.dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    await click(label, await waitFor(() => document.querySelector('.svn-file-menu')))
  }
  try {
    execFileSync('svnadmin', ['create', temp + '/repo'])
    svn('mkdir', '-qm', 'layout', trunk)
    svn('checkout', '-q', trunk, wc)
    mkdirSync(wc + '/src')
    writeFileSync(wc + '/' + a, 'base a\n')
    writeFileSync(wc + '/' + b, 'base b\n')
    svn('add', '-q', wc + '/src', wc + '/' + b)
    svn('commit', '-qm', 'base', wc)
    svn('copy', '-qm', 'branch', trunk, repo + '/release')
    svn('delete', '-m', 'remove branch file', repo + '/release/' + a)
    svn('checkout', '-q', trunk, peer)
    writeFileSync(wc + '/' + a, 'local a\n')
    writeFileSync(wc + '/' + b, 'local b\n')
    app.render(React.createElement(Panel))
    await waitFor(() => row(a) && row(b), '等待初始变更')
    locale = 'en'
    document.documentElement.lang = locale
    await waitFor(() => button('Changes') && button('Commit selected'))
    assert.ok(document.querySelector('input[placeholder="Filter paths…"]'))
    locale = 'zh-CN'
    document.documentElement.lang = locale
    await waitFor(() => button('更改') && button('提交所选'))


    filter('src/')
    await waitFor(() => row(a) && !row(b), '等待路径筛选')
    await click('全选')
    await waitFor(() => row(a).classList.contains('sel'))
    await click('反选')
    await waitFor(() => !row(a).classList.contains('sel'))
    await click('反选')
    await waitFor(() => row(a).classList.contains('sel'))
    await menu(a, '还原修改')
    const revert = await waitFor(modal)
    assert.equal(revert.querySelector('details pre').textContent, a)
    await click('还原', revert)
    await closed()
    assert.equal(readFileSync(wc + '/' + a, 'utf8'), 'base a\n')
    assert.equal(readFileSync(wc + '/' + b, 'utf8'), 'local b\n')

    writeFileSync(wc + '/' + a, 'keep local a\n')
    document.querySelector('button[title=刷新]').click()
    await waitFor(() => row(a))
    filter('')
    await waitFor(() => row(a) && row(b))
    row(b).querySelector('input').click()
    await waitFor(() => row(b).classList.contains('sel'))
    row(a).dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    await waitFor(() => document.querySelector('.svn-file-menu'))
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
    await waitFor(() => !document.querySelector('.svn-file-menu'))
    assert.ok(row(b).classList.contains('sel'))
    assert.ok(!row(a).classList.contains('sel'))

    mkdirSync(wc + '/generated')
    writeFileSync(wc + '/generated/child', 'fixture')
    for (let index = 0; index < 7; index++) writeFileSync(wc + '/artifact-' + index, 'fixture')
    document.querySelector('button[title=刷新]').click()
    await waitFor(() => row('generated') && !document.querySelector('.svn-list .svn-loading'))
    for (const node of rows().filter((item) => /^(artifact-|generated)/.test(item.title))) {
      node.querySelector('input').click()
    }
    filter('generated')
    await waitFor(() => document.body.textContent.includes('8 项当前不可见'))
    await click('纳入')
    const add = await waitFor(modal)
    assert.match(add.querySelector('summary').textContent, /8 项，其中 7 项当前不可见/)
    assert.match(add.querySelector('details pre').textContent, /artifact-6/)
    assert.match(add.textContent, /子项/)
    await click('取消', add)
    await closed()
    rmSync(wc + '/generated', { recursive: true })
    for (let index = 0; index < 7; index++) rmSync(wc + '/artifact-' + index)
    document.querySelector('button[title=刷新]').click()
    await waitFor(() => !row('generated'))

    filter('src/')
    await waitFor(() => document.body.textContent.includes('1 项当前不可见'))
    await click('✓ 提交')
    const commit = await waitFor(modal)
    assert.match(commit.querySelector('summary').textContent, /1 项当前不可见/)
    assert.equal(commit.querySelector('details pre').textContent, b)
    input(commit.querySelector('textarea'), 'only b')
    await click('提交', commit)
    await closed()
    assert.equal(svn('cat', trunk + '/' + a), 'base a\n')
    assert.deepEqual(simulatedCommit.slice(simulatedCommit.indexOf('--') + 1), [(process.platform === 'win32' ? wc.replace(/\\/g, '/') : wc) + '/' + b + '@'])
    assert.equal(svn('cat', trunk + '/' + b), 'base b\n')
    assert.equal(readFileSync(wc + '/' + a, 'utf8'), 'keep local a\n')

    filter('')
    writeFileSync(wc + '/' + a, 'mine\n')
    writeFileSync(wc + '/' + b, 'never commit this\n')
    await click('刷新')
    await waitFor(() => row(a) && row(b))
    for (const [command, menuAction, titleSelector] of [
      ['diff', '查看差异', '.svn-diff-title'],
      ['blame', '逐行溯源', '.svn-diff-title'],
    ]) {
      let release, finish
      const done = new Promise((resolve) => { finish = resolve })
      hold = { command, finish, release: new Promise((resolve) => { release = resolve }) }
      await menu(a, menuAction)
      await click('更改')
      await menu(b, menuAction)
      await waitFor(() => document.querySelector(titleSelector)?.textContent.includes(b) &&
        !document.querySelector('.svn-loading'))
      await React.act(async () => {
        release()
        await done
      })
      hold = null
      assert.match(document.querySelector(titleSelector).textContent, /other\.txt/)
      await click('更改')
    }

    svn('revert', wc + '/' + b)
    writeFileSync(peer + '/' + a, 'incoming\n')
    svn('commit', '-qm', 'incoming', peer + '/' + a)
    await click('↓ 更新')
    await click('开始更新', await waitFor(modal))
    await closed()
    await waitFor(() => document.querySelector('select[aria-label="解决方式"]'))
    await click('更改')
    ;(await waitFor(() => row(a))).querySelector('input').click()
    await waitFor(() => row(a).classList.contains('sel'))
    await click('✓ 提交')
    const excluded = await waitFor(modal)
    assert.match(excluded.textContent, /src\/a\.txt（有未解决的冲突）/)
    assert.equal(button('提交', excluded), undefined)
    await click('取消', excluded)
    await click('解决冲突')
    input(await waitFor(() => document.querySelector('select[aria-label="解决方式"]')), 'theirs-full')
    await click('确认解决')
    await waitFor(() => document.body.textContent.includes('没有未解决的冲突'))
    assert.equal(readFileSync(wc + '/' + a, 'utf8'), 'incoming\n')
    assert.doesNotMatch(svn('status', '--xml', wc), /item="conflicted"/)
    assert.equal(svn('cat', trunk + '/' + a), 'incoming\n')

    writeFileSync(wc + '/' + a, 'temporary\n')
    await click('更改')
    await click('刷新')
    await menu(a, '查看文件历史')
    await waitFor(() => document.querySelector('.svn-logrow'))
    svn('revert', wc + '/' + a)
    await click('切换分支／标签')
    const switching = await waitFor(modal)
    input(switching.querySelector('input'), '^/release')
    failNextLog = true
    await click('切换', switching)
    await closed()
    await click('历史')
    await waitFor(() => document.body.textContent.includes('模拟历史加载失败'))
    assert.equal(document.querySelectorAll('.svn-logrow').length, 0)
    document.querySelector('button[title=刷新]').click()
    await waitFor(() => [...document.querySelectorAll('.svn-logrow')].some((node) => node.textContent.includes('remove branch file')))
    assert.equal(svn('info', '--show-item', 'relative-url', wc).trim(), '^/release')
    await click('更改')
    writeFileSync(wc + '/' + b, 'temporary failure fixture\n')
    document.querySelector('button[title=刷新]').click()
    await waitFor(() => row(b))
    failAfterRevert = true
    await menu(b, '还原修改')
    await click('还原', await waitFor(modal))
    await waitFor(() => !row(b) && document.body.textContent.includes('模拟部分完成后失败'))
    await click('取消', await waitFor(modal))
    await closed()
    await click('更多 SVN 操作')
    await waitFor(() => document.querySelector('select[aria-label="SVN 操作类型"]'))
    await click('确定 · 连接诊断', modal())
    await waitFor(() => modal()?.textContent.includes('连接成功'))
    input(document.querySelector('select[aria-label="SVN 操作类型"]'), 'properties')
    await click('确定 · 读取属性', modal())
    await waitFor(() => modal()?.textContent.includes('无属性'))
    await waitFor(() => !document.querySelector('select[aria-label="SVN 操作类型"]').disabled)
    input(document.querySelector('select[aria-label="SVN 操作类型"]'), 'operations')
    await waitFor(() => modal()?.textContent.includes('模拟部分完成后失败'))
    locale = 'en'
    document.documentElement.lang = locale
    await waitFor(() => document.querySelector('select[aria-label="SVN operation type"]'))
    assert.ok(modal().textContent.includes('Operation history'))
    assert.ok(button('More SVN operations'))
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
    await closed()

  } finally {
    app.unmount()
    dom.window.close()
    rmSync(temp, { recursive: true, force: true })
  }
})
