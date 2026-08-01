const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  "if (!response.ok) throw new Error('Failed to get response');",
  "if (!response.ok) {\n        const errData = await response.json().catch(() => ({}));\n        throw new Error(errData.error || 'Failed to get response');\n      }"
);
fs.writeFileSync('src/App.tsx', app);
