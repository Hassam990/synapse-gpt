async function testGroqKey() {
  const apiKey = "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";
  console.log("Testing New Groq Key with Llama 3.3...");
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    console.log("Status:", res.status);
    const data = await res.json();
    if (res.ok) {
        console.log("SUCCESS! Groq is working with Llama 3.3.");
        console.log("Response Preview:", data.choices?.[0]?.message?.content?.substring(0, 50));
    } else {
        console.log("Response:", JSON.stringify(data, null, 2));
    }

  } catch (e) {
    console.error("Test failed:", e);
  }
}

testGroqKey();
