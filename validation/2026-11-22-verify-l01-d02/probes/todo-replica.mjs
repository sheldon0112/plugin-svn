import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
const svn = process.env.SLIK_SVN
const svnadmin = join(dirname(svn), 'svnadmin.exe')
const temp = mkdtempSync(join(tmpdir(), 'ccgui-todo-'))
try {
  execFileSync(svnadmin, ['create', join(temp, 'repo')])
  const url = pathToFileURL(join(temp, 'repo')).href + '/trunk'
  execFileSync(svn, ['mkdir', '-qm', 'layout', url])
  const directory = join(temp, '中文目录')
  const step = (label, fn) => { try { fn(); console.log(label, 'OK') } catch (e) { console.log(label, 'FAIL:', JSON.stringify(String(e.stderr || e.message).slice(0, 160))) } }
  let wcUrl
  step('检出中文目录', () => execFileSync(svn, ['checkout', '-q', '--ignore-externals', '--', url + '@HEAD', directory], { encoding: 'utf8' }))
  step('写入中文文件', () => writeFileSync(join(directory, '中文文件.txt'), '中文内容\n'))
  step('add 中文文件', () => execFileSync(svn, ['add', '--parents', join(directory, '中文文件.txt')], { encoding: 'utf8' }))
  step('commit 中文提交', () => execFileSync(svn, ['commit', '-qm', '中文提交', join(directory, '中文文件.txt')], { encoding: 'utf8' }))
  step('propset 中文值', () => execFileSync(svn, ['propset', '--non-interactive', 'custom:t', '中文值', '--', join(directory, '中文文件.txt')], { encoding: 'utf8' }))
  step('status --xml 中文路径', () => execFileSync(svn, ['status', '--xml', join(directory)], { encoding: 'utf8' }))
  step('log --xml 中文消息回读', () => { const out = execFileSync(svn, ['log', '--xml', '-r', 'HEAD', join(directory, '中文文件.txt')], { encoding: 'utf8' }); console.log('  回读消息:', /<msg>([^<]*)<\/msg>/.exec(out)?.[1]) })
} finally { rmSync(temp, { recursive: true, force: true }) }
