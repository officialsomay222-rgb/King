fetch('https://api-inference.huggingface.co/models/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + (process.env.HF_TOKEN || 'fake') }
}).then(r => r.text()).then(console.log).catch(console.error);
