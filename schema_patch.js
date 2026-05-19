const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');
const insertIndex = lines.findIndex(l => l.includes('updatedAt                    DateTime @updatedAt'));

if (insertIndex !== -1) {
  lines.splice(insertIndex, 0, 
    '  aiProvider                   String?  @default("openai")',
    '  aiModel                      String?  @default("gpt-4o")',
    '  aiApiKey                     String?'
  );
  fs.writeFileSync('prisma/schema.prisma', lines.join('\n'));
  console.log('Schema updated successfully.');
} else {
  console.error('Could not find insertion point.');
}
