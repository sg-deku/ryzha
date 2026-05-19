const fs = require('fs');

const files = [
  'lib/agents/r2r.ts',
  'lib/agents/auditor.ts',
  'lib/agents/om.ts',
  'lib/agents/fpna.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('await getLLM(organizationId', 'await getLLM(transaction.organizationId');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
