import { execFileSync } from 'node:child_process'
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const run = (args) => execFileSync('svn', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
const intended = '中文忽略\n'
const utf8 = Buffer.from(intended, 'utf8')
const gbkDecoder = new TextDecoder('gbk')
const decoy = gbkDecoder.decode(utf8)
console.log('替身字符:', JSON.stringify(decoy))
run(['propdel','-q','custom:probe','--','a.txt@'])
run(['propset','--non-interactive','custom:probe', decoy, '--','a.txt@'])
const xml = run(['proplist','--xml','-v','--','a.txt@'])
const m = /<property\s+([^>]*)>([\s\S]*?)<\/property>/.exec(xml)
const enc = /encoding="([^"]+)"/.exec(m?.[1] ?? '')?.[1] || 'plain'
const raw = m?.[2]?.replace(/\r\n/g,'\n') ?? ''
console.log('encoding=' + enc, '| 回读一致:', enc === 'plain' && raw === intended)
// 3 个中文字符(UTF-8 9字节,奇数高字节)的无损性测试
const v3 = '中文名'
const decoy3 = gbkDecoder.decode(Buffer.from(v3, 'utf8'))
run(['propdel','-q','custom:probe2','--','a.txt@'])
run(['propset','--non-interactive','custom:probe2', decoy3, '--','a.txt@'])
const xml3 = run(['proplist','--xml','-v','--','a.txt@'])
const m3 = /<property\s+name="custom:probe2"[^>]*>([\s\S]*?)<\/property>|<property\s+([^>]*)name="custom:probe2"([^>]*)>([\s\S]*?)<\/property>/.exec(xml3)
console.log('3字探针 XML:', xml3.slice(xml3.indexOf('probe2')-40, xml3.indexOf('probe2')+80))
