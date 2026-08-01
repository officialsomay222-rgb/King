const apiKey = process.env.GROQ_API || 'FAKE';
async function test() {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_tokens: 2048,
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
