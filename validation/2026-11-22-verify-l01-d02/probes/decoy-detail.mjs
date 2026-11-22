const cases = ['一', '三中文', '🎉', '中a文']
for (const value of cases) {
  const utf8 = Buffer.from(value, 'utf8')
  const decoy = new TextDecoder('gbk').decode(utf8)
  console.log(JSON.stringify(value), '| utf8:', utf8.toString('hex'), '| decoy:', JSON.stringify(decoy), '| decoy码点:', Array.from(decoy).map(c => c.codePointAt(0).toString(16)).join(' '))
}
