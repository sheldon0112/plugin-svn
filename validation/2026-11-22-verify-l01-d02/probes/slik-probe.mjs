import { execFileSync } from 'node:child_process'
const svn = process.env.SLIK_SVN
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const trySet = (label, value) => {
  try {
    execFileSync(svn, ['propset', '--non-interactive', 'custom:slik', value, '--', 'a.txt@'], { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
    const xml = execFileSync(svn, ['propget', 'custom:slik', '--xml', '--', 'a.txt@'], { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
    const m = /<property\s+([^>]*)>([\s\S]*?)<\/property>/.exec(xml)
    const enc = /encoding="([^"]+)"/.exec(m?.[1] ?? '')?.[1] || 'plain'
    const raw = m?.[2]?.replace(/\r\n/g, '\n') ?? ''
    const bytes = enc === 'base64' ? Buffer.from(raw.trim(), 'base64') : Buffer.from(raw, 'utf8')
    console.log(label, '| encoding=' + enc, '| hex=' + bytes.toString('hex').slice(0, 24), '| 期望一致:', raw === value.replace(/\r\n/g, '\n'))
  } catch (e) { console.log(label, 'ERR:', JSON.stringify(String(e.stderr).slice(0, 100))) }
}
trySet('直接中文忽略:', '中文忽略')
trySet('替身:', new TextDecoder('gbk').decode(Buffer.from('中文忽略', 'utf8')))
