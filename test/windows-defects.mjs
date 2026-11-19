import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
assert.equal(process.platform, 'win32', '此取证脚本必须在真实 Windows 运行')
const svn = process.env.CCGUI_SVN_EXE
assert.ok(svn, '必须提供已确认的绝对 svn.exe 路径')
const svnadmin = join(dirname(svn), 'svnadmin.exe')
const root = mkdtempSync(join(tmpdir(), 'ccgui-defect-proof-'))
const bytes = value => ({ text: value.toString('utf8'), hex: value.toString('hex') })
const execute = (bin, args, env = {}) => {
 try { return { code: 0, stdout: bytes(execFileSync(bin, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] })), stderr: bytes(Buffer.alloc(0)) } }
 catch (e) { return { code: e.status, error: e.message, stdout: bytes(e.stdout || Buffer.alloc(0)), stderr: bytes(e.stderr || Buffer.alloc(0)) } }
}
const results = { platform: process.platform, node: process.version, exe: svn, sha256: createHash('sha256').update(readFileSync(svn)).digest('hex'), version: execute(svn, ['--version', '--quiet']), cases: [] }
try {
 assert.equal(execute(svnadmin, ['create', join(root, 'repo')]).code, 0)
 const url = pathToFileURL(join(root, 'repo')).href
 const unicode = '中文目录'
 const child = execute(process.execPath, ['-e', 'process.stdout.write(JSON.stringify(process.argv.slice(1)))', unicode, 'space @wc'])
 results.argumentProbe = child
 assert.deepEqual(JSON.parse(child.stdout.text), [unicode, 'space @wc'])
 let i = 0
 for (const [label, name, suffix, env] of [
  ['L-01-inherited', unicode, '', {}],
  ['L-01-plugin-env', unicode, '', { LC_ALL: 'en_US.UTF-8' }],
  ['L-02-original', 'space @wc', '', { LC_ALL: 'en_US.UTF-8' }],
  ['L-02-trailing-separator-candidate', 'space @wc', '/', { LC_ALL: 'en_US.UTF-8' }],
 ]) {
  const parent = join(root, 'case-' + (++i)); const directory = join(parent, name)
  const args = ['checkout', '--non-interactive', '--ignore-externals', '--', url + '@HEAD', directory + suffix]
  const outcome = execute(svn, args, env)
  let names = []; try { names = readdirSync(parent) } catch {}
  results.cases.push({ label, directory, args, env, utf16: Array.from({ length: name.length }, (_, index) => name.charCodeAt(index).toString(16).padStart(4, '0')), outcome, names, exactDirectoryCreated: names.includes(name) })
 }
} finally {
 writeFileSync('windows-defects.json', JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2)); rmSync(root, { recursive: true, force: true })
}
