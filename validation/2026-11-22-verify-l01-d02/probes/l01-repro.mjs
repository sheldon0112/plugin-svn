import { execFileSync } from 'node:child_process'
const cwd = 'C:/Users/Sheldon/AppData/Local/Temp/l01-probe/wc'
const run = (args) => execFileSync('svn', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
console.log('propset:', JSON.stringify(run(['propset','--non-interactive','custom:qa','中文\nvalue','--','a.txt@'])))
const xml = run(['proplist','--xml','-v','--','a.txt@'])
console.log('XML:', JSON.stringify(xml))
