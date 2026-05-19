const fs = require('fs');

const files = [
  'lib/agents/r2r.ts',
  'lib/agents/auditor.ts',
  'lib/agents/o2c/order-intake.ts',
  'lib/agents/o2c/credit.ts',
  'lib/agents/om.ts',
  'lib/agents/fpna.ts',
  'lib/agents/o2c/dispute.ts',
  'lib/agents/p2p/invoice-capture.ts',
  'lib/agents/p2p/vendor-intake.ts',
  'lib/agents/o2c/pricing.ts',
  'lib/agents/o2c/customer-validation.ts',
  'lib/agents/p2p/approval.ts',
  'lib/agents/p2p/gl-coding.ts',
  'lib/agents/o2c/collections.ts',
  'lib/agents/p2p/requisition.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import if not present
  if (!content.includes('import { getLLM }')) {
    content = content.replace('import { ChatOpenAI } from "@langchain/openai"', 'import { getLLM } from "@/lib/ai/llm"');
  }

  // Replace new ChatOpenAI(...) with await getLLM(organizationId, ...)
  content = content.replace(/new ChatOpenAI\(\{([\s\S]*?)\}\)/g, 'await getLLM(organizationId, {$1})');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
