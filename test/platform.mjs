import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8')
const helpers = source.slice(source.indexOf('  function isAbsolute('), source.indexOf('  const operations ='))
// Extract the production helpers without adding test exports to the plugin.
const { localPath, relativePath, pathKey } = Function('t', helpers + '\nreturn { localPath, relativePath, pathKey }')(x => x)

test('Windows 盘符、UNC、大小写、分隔符及越界路径', () => {
  assert.equal(relativePath('C:\\Work\\项目', 'c:/work/项目/src\\a.txt'), 'src/a.txt')
  assert.equal(relativePath('C:\\Work', 'C:\\Work-other\\a'), null)
  assert.equal(relativePath('C:\\Work', 'D:\\Work\\a'), null)
  assert.equal(relativePath('\\\\server\\share\\wc', '//SERVER/share/wc/a'), 'a')
  assert.equal(pathKey('C:\\Work\\'), pathKey('c:/work'))
  assert.equal(localPath('C:\\Work\\', 'src\\中文 @.txt'), 'C:/Work/src/中文 @.txt')
  for (const rel of ['C:foo', '../a', '..\\a', 'NUL.txt', 'aux', 'COM1.log', 'a:b', 'a?', 'a*', 'a.', 'a ', 'x\0y', 'x\ny']) {
    assert.throws(() => localPath('C:\\Work', rel), undefined, rel)
  }
  assert.equal(localPath('/Users/Wc', 'a?'), '/Users/Wc/a?')
  assert.equal(relativePath('/Users/Wc', '/users/wc/a'), null)
  assert.equal(localPath('C:/wc', 'a/'.repeat(150) + 'file.txt').length > 260, true)
})

test('安装包复制、启动注册及卸载清理（模拟宿主）', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'ccgui-install-'))
  try {
    const installed = join(temp, 'plugins', 'ccgui-svn')
    mkdirSync(installed, { recursive: true })
    for (const file of ['manifest.json', 'main.js']) cpSync(new URL('../' + file, import.meta.url), join(installed, file))
    const manifest = JSON.parse(readFileSync(join(installed, 'manifest.json'), 'utf8'))
    assert.equal(manifest.tier, 'js')
    assert.doesNotMatch(source, /^import\s/m)
    // CRLF must remain loadable, as with a Windows checkout.
    writeFileSync(join(installed, 'main.mjs'), source.replace(/\r?\n/g, '\r\n'))
    const { default: activate } = await import(pathToFileURL(join(installed, 'main.mjs')))
    let registrations = 0
    activate({ react: {}, theme: { injectCss() {} }, i18n: { addBundle() {} },
      ui: { registerCenterTab() { registrations++ }, registerSidebarNav() { registrations++ } } })
    assert.equal(registrations, 2)
    rmSync(installed, { recursive: true })
    assert.equal(existsSync(installed), false)
  } finally { rmSync(temp, { recursive: true, force: true }) }
})
