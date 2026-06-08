require('dotenv').config({ path: './backend/.env' });

async function testGroq() {
  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "hi" }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 5
    });
    console.log("GROQ_WORKS:", completion.choices[0].message.content);
    return true;
  } catch (e) {
    console.log("GROQ_FAILED:", e.message);
    return false;
  }
}

async function testGemini() {
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'hi'
    });
    console.log("GEMINI_WORKS:", response.text);
    return true;
  } catch (e) {
    console.log("GEMINI_FAILED:", e.message);
    return false;
  }
}

async function testOpenAI() {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{role: "user", content: "hi"}],
        max_tokens: 5
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log("OPENAI_WORKS:", data.choices[0].message.content);
    return true;
  } catch(e) {
    console.log("OPENAI_FAILED:", e.message);
    return false;
  }
}

async function testDeepSeek() {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{role: "user", content: "hi"}],
        max_tokens: 5
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    console.log("DEEPSEEK_WORKS:", data.choices[0].message.content);
    return true;
  } catch(e) {
    console.log("DEEPSEEK_FAILED:", e.message);
    return false;
  }
}

async function main() {
  console.log("Testing API keys from backend/.env...");
  await testGroq();
  await testGemini();
  await testOpenAI();
  await testDeepSeek();
}
main();
