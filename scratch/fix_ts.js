const fs = require('fs');
const path = require('path');

const files = ['billing.ts', 'inpatient.ts', 'pharmacy.ts', 'quality.ts', 'radiology.ts', 'revenue.ts'];

for (const file of files) {
  const filePath = path.join(process.cwd(), 'src', 'convex', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /handler: async \(ctx, args\) => \{\n\s*if \(args\.([a-zA-Z]+)\) \{/, 
    'handler: async (ctx, args) => {\n    const { $1 } = args;\n    if ($1) {'
  );
  
  content = content.replace(/args\.patientId/g, 'patientId');
  content = content.replace(/args\.invoiceId/g, 'invoiceId');
  content = content.replace(/args\.date/g, 'date');
  
  fs.writeFileSync(filePath, content);
}
