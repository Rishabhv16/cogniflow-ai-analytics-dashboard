const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace('import { GoogleGenAI, Type } from "@google/genai";', 'import Groq from "groq-sdk";');
code = code.replace(/let aiClient: GoogleGenAI \| null = null;/g, 'let aiClient: Groq | null = null;');
code = code.replace(/function getGeminiClient\(\): GoogleGenAI \{[\s\S]*?return aiClient;\n\}/m, `function getGroqClient(): Groq {
  if (!aiClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === "MY_GROQ_API_KEY") {
      throw new Error("GROQ_API_KEY environment variable is not configured.");
    }
    aiClient = new Groq({ apiKey: key });
  }
  return aiClient;
}`);
code = code.replace(/getGeminiClient/g, 'getGroqClient');
code = code.replace(/GEMINI_API_KEY/g, 'GROQ_API_KEY');

// Replace translate-rule
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?\}\);\n\n    const jsonText = response\.text \|\| "\{\}";/m, `const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const jsonText = response.choices[0]?.message?.content || "{}";`);

// Replace copilot
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?model: "gemini-2\.0-flash",[\s\S]*?contents: formattedContents,[\s\S]*?config: \{[\s\S]*?systemInstruction: systemPrompt,[\s\S]*?temperature: 0\.7,[\s\S]*?\}[\s\S]*?\}\);\n\n    \/\/ Return as "content" key to match the frontend expectation\n    return res\.json\(\{ content: response\.text \|\| "" \}\);/m, `formattedContents.unshift({ role: "system", content: systemPrompt });
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: formattedContents,
      temperature: 0.7,
    });

    // Return as "content" key to match the frontend expectation
    return res.json({ content: response.choices[0]?.message?.content || "" });`);

// Replace explainability
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?model: "gemini-2\.0-flash",[\s\S]*?contents: \`You are an enterprise[\s\S]*?no markdown\.\`,[\s\S]*?\}\);\n    narrative = response\.text \|\| narrative;/m, `const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: \`You are an enterprise decision explainability AI. Generate a professional 2-3 sentence audit narrative.
Rule: \${rule_id}, Outcome: \${outcome}
Top factors: \${topFactors.map(([k,v]) => \`\${k}: \${v}\`).join(", ")}
Decision path: \${decision_path.slice(0,4).join(" | ")}
Context: \${JSON.stringify(context_data)}
Return ONLY the narrative text, no JSON, no markdown.\` }],
    });
    narrative = response.choices[0]?.message?.content || narrative;`);

// Replace compliance
code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?model: "gemini-2\.0-flash",[\s\S]*?contents: \`You are a compliance AI[\s\S]*?config: \{ responseMimeType: "application\/json" \}[\s\S]*?\}\);\n    const parsed = JSON\.parse\(response\.text \|\| "\{\}"\);/m, `const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: \`You are a compliance AI. Analyze this policy for regulatory gaps. Return ONLY JSON:
{"alerts":[{"severity":"HIGH|MEDIUM|LOW","regulation_name":"string","article":"string","description":"string","recommendation":"string"}],"score":0-100,"summary":"string"}
Policy: "\${policy_text}"
Regulations to check: \${matched.map(([_, r]) => r.source).join(", ")}\` }],
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");`);

fs.writeFileSync('server.ts', code);
console.log('Successfully updated server.ts to use Groq');
