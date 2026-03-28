async function testChat() {
  const payload = {
    systemPrompt: "You are a helpful assistant.",
    messages: [{ role: "user", content: "Hello, who are you?" }]
  };

  try {
    console.log("Testing /api/chat with payload:", JSON.stringify(payload, null, 2));
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Status Code:", response.status);
    if (!response.ok) {
        const text = await response.text();
        console.error("Error Response:", text);
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
    console.log("\n--- Stream Ended ---");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testChat();
