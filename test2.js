fetch('https://router.huggingface.co/hf-inference/models/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer hf_fake' },
  body: JSON.stringify({model: 'DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF', messages: [{role: 'user', content: 'hello'}]})
}).then(r => r.json()).then(console.log).catch(console.error);
