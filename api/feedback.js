export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an English speaking coach. Analyze this sentence: "${req.body.text}". 
            Give very short feedback and a score (1-10) in English.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Gemini'ın cevap yapısı OpenAI'dan farklıdır
    const reply = data.candidates[0].content.parts[0].text;

    res.status(200).json({ reply: reply });

  } catch (err) {
    res.status(500).json({ reply: "Gemini Bağlantı Hatası: " + err.message });
  }
}