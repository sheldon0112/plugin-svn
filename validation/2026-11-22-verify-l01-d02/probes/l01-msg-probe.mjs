import { execFileSync } from 'node:child_process'
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const run = (args, opts = {}) => execFileSync('svn', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'], ...opts })
run(['commit','-qm','中文提交消息','--','a.txt@'])
const log = run(['log','-r','HEAD','--xml','--','a.txt@'])
console.log('提交信息回读:', JSON.stringify(/<msg>([\s\S]*?)<\/msg>/.exec(log)?.[1]))
console.log('期望: 中文提交消息  一致:', log.includes('中文提交消息'))
