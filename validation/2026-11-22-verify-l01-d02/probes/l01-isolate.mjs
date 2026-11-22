import { execFileSync } from 'node:child_process'
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const run = (args) => execFileSync('svn', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
const probe = (label, value) => {
  run(['propdel','--non-interactive','custom:probe','--','a.txt@'])
  run(['propset','--non-interactive','custom:probe', value, '--','a.txt@'])
  const xml = run(['proplist','--xml','-v','--','a.txt@'])
  const m = /<property\s+([^>]*)>([\s\S]*?)<\/property>/.exec(xml)
  const attrs = m?.[1] ?? ''
  const enc = /encoding="([^"]+)"/.exec(attrs)?.[1] || 'none'
  const raw = m?.[2]?.trim() ?? ''
  const bytes = enc === 'base64' ? Buffer.from(raw, 'base64') : Buffer.from(raw.replace(/\r\n/g, '\n'), 'utf8')
  console.log(label, '| encoding=' + enc, '| hex=' + bytes.toString('hex').slice(0, 32))
}
probe('A: Node argv + 换行   ', '中文\nvalue')
probe('B: Node argv 无换行   ', '中文忽略')
probe('C: Node argv 纯ASCII+换行', 'en\nvalue')
