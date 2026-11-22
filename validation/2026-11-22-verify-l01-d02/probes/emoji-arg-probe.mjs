import { execFileSync } from 'node:child_process'
// argv 探针：看子进程实际收到什么
const probe = execFileSync(process.execPath, ['-e', 'process.stdout.write(JSON.stringify(process.argv.slice(1)))', '馃帀', '🎉'], { encoding: 'utf8' })
console.log('argv 探针:', probe)
// 直接对探针 WC 执行 propset
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const trySet = (label, value) => {
  try {
    const out = execFileSync('svn', ['propset', '--non-interactive', 'custom:e', value, '--', 'dir@'], { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
    console.log(label, 'OK:', JSON.stringify(out.trim()))
  } catch (e) { console.log(label, 'ERR:', JSON.stringify(String(e.stderr).slice(0, 120))) }
}
trySet('直接🎉:', '🎉')
trySet('替身馃帀:', '馃帀')
