import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
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
  const parent = join(root, 'case-' + (++i)); mkdirSync(parent); const directory = join(parent, name)
  const args = ['checkout', '--non-interactive', '--ignore-externals', '--', url + '@HEAD', directory + suffix]
  const outcome = execute(svn, args, env)
  let names = []; try { names = readdirSync(parent) } catch {}
  results.cases.push({ label, directory, args, env, utf16: Array.from({ length: name.length }, (_, index) => name.charCodeAt(index).toString(16).padStart(4, '0')), outcome, names, exactDirectoryCreated: names.includes(name) })
 }
 // 长路径/UNC/NTFS ACL 风险探针：仅记录行为取证，不设通过性断言（结论按宿主环境解读）。
 results.environmentProbes = {}
 try {
  let value = 'disabled'; try { value = execFileSync('reg', ['query', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', '/v', 'LongPathsEnabled'], { encoding: 'utf8' }).includes('0x1') ? 'enabled' : 'disabled' } catch { value = 'unknown' }
  results.environmentProbes.longPathsEnabled = value
  const deep = join(root, 'deep'); let longTarget = deep; for (let n = 0; n < 40; n++) longTarget = join(longTarget, 'segment-0123456789')
  const longOutcome = execute(svn, ['checkout', '--non-interactive', '--ignore-externals', '--', url + '@HEAD', longTarget])
  results.environmentProbes.longPath = { length: longTarget.length, thresholdExceeded: longTarget.length > 260, code: longOutcome.code, stderr: longOutcome.stderr.text.slice(0, 200), checkoutWorked: (() => { try { return readdirSync(longTarget).length > 0 } catch { return false } })() }
 } catch (error) { results.environmentProbes.longPath = { error: String(error) } }
 try {
  const uncTarget = '\\\\localhost\\C$\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Temp\\ccgui-defect-unc-wc'
  rmSync(uncTarget, { recursive: true, force: true })
  const uncOutcome = execute(svn, ['checkout', '--non-interactive', '--ignore-externals', '--', url + '@HEAD', uncTarget])
  let uncWorks = false; try { uncWorks = readdirSync(uncTarget).length > 0 } catch {}
  results.environmentProbes.uncAdminShare = { target: uncTarget, code: uncOutcome.code, stderr: uncOutcome.stderr.text.slice(0, 200), checkoutWorked: uncWorks }
  rmSync(uncTarget, { recursive: true, force: true })
 } catch (error) { results.environmentProbes.uncAdminShare = { error: String(error) } }
 try {
  const aclParent = join(root, 'acl'); mkdirSync(aclParent)
  const aclCase = { label: 'acl-deny-write', steps: [] }
  const aclWc = join(aclParent, 'wc')
  execute(svn, ['checkout', '--non-interactive', '--ignore-externals', '--', url + '@HEAD', aclWc])
  writeFileSync(join(aclWc, 'a.txt'), 'base\n')
  execute(svn, ['add', '--parents', join(aclWc, 'a.txt')])
  const commit = execute(svn, ['commit', '-qm', 'acl-base', join(aclWc, 'a.txt')])
  aclCase.steps.push({ step: 'commit a.txt', code: commit.code, stderr: commit.stderr.text.slice(0, 160) })
  writeFileSync(join(aclWc, 'a.txt'), 'local change\n')
  try { execFileSync('icacls', [join(aclWc, 'a.txt'), '/deny', process.env.USERNAME + ':(OI)(CI)(W)'], { stdio: 'ignore' }); aclCase.steps.push({ step: 'icacls deny write a.txt', done: true }) } catch (e) { aclCase.steps.push({ step: 'icacls deny write a.txt', error: String(e).slice(0, 160) }) }
  const statusAfter = execute(svn, ['status', '--xml', '--depth', 'empty', '--', join(aclWc, 'a.txt')])
  aclCase.steps.push({ step: 'status --xml denied file', code: statusAfter.code, stderr: statusAfter.stderr.text.slice(0, 160) })
  const revertDenied = execute(svn, ['revert', '--depth', 'empty', '--', join(aclWc, 'a.txt')])
  aclCase.steps.push({ step: 'revert denied file', code: revertDenied.code, stderr: revertDenied.stderr.text.slice(0, 160) })
  try {
    execFileSync('icacls', [join(aclWc, 'a.txt'), '/remove:d', process.env.USERNAME], { stdio: 'ignore' })
    execFileSync('icacls', [join(aclWc, '.svn'), '/deny', process.env.USERNAME + ':(OI)(CI)(W)'], { stdio: 'ignore' })
    const statusMeta = execute(svn, ['status', '--xml', join(aclWc)])
    aclCase.steps.push({ step: 'status --xml .svn deny write', code: statusMeta.code, stderr: statusMeta.stderr.text.slice(0, 160) })
    writeFileSync(join(aclWc, 'a.txt'), 'second change\n')
    const commitMeta = execute(svn, ['commit', '-qm', 'meta-deny', join(aclWc, 'a.txt')])
    aclCase.steps.push({ step: 'commit with .svn deny write', code: commitMeta.code, stderr: commitMeta.stderr.text.slice(0, 160) })
  } catch (e) { aclCase.steps.push({ step: '.svn deny write phase', error: String(e).slice(0, 160) }) } finally {
    try { execFileSync('icacls', [join(aclWc, '.svn'), '/remove:d', process.env.USERNAME], { stdio: 'ignore' }) } catch {}
  }
  try { execFileSync('icacls', [join(aclWc, 'a.txt'), '/remove:d', process.env.USERNAME], { stdio: 'ignore' }) } catch {}
  results.cases.push(aclCase)
 } catch (error) { results.cases.push({ label: 'acl-deny-write', error: String(error) }) }
} finally {
 writeFileSync('windows-defects.json', JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2)); rmSync(root, { recursive: true, force: true })
}
