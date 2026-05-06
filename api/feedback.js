export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // OpenAI API Key kontrolü
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("API Key eksik! Vercel ayarlarını kontrol et.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an English speaking coach. Give short feedback and a score (1-10)."
          },
          {
            role: "user",
            content: req.body || "Hello" 
          }
        ]
      })
    });

    const data = await response.json();
    
    // Eğer OpenAI hata dönerse onu yakalayalım
    if (data.error) {
      return res.status(500).json({ reply: "Hata: " + data.error.message });
    }

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ reply: "Sistem hatası: " + err.message });
  }
}