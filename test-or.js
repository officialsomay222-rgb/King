const apiKey = process.env.Owner || 'FAKE';
async function test() {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "nousresearch/hermes-4-70b",
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      messages: [
        { role: "user", content: "test" }
      ]
    })
  });
  console.log(response.status);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
