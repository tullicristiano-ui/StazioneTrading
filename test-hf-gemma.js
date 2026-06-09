import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "google/gemma-4-31B-it";

if (!HF_TOKEN) {
  console.error("Errore: HF_TOKEN non trovato nel file .env.local");
  process.exit(1);
}

const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${HF_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: HF_MODEL,
    messages: [
      {
        role: "user",
        content: "Rispondi in italiano con una frase breve: Gemma funziona?",
      },
    ],
    max_tokens: 120,
    temperature: 0.2,
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error("Errore Hugging Face:");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("Risposta Gemma:");
console.log(data.choices?.[0]?.message?.content || data);