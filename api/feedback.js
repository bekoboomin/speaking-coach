export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Hata: GEMINI_API_KEY bulunamadı! Vercel Environment Variables kısmını kontrol et." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an English coach. Respond to: "${req.body.text}". Short feedback + score.`
          }]
        }]
      })
    });

    const data = await response.json();

    // Konsola hatayı yazdıralım (Vercel Logs kısmından görebilirsin)
    console.log("Gemini Yanıtı:", JSON.stringify(data));

    if (data.error) {
      return res.status(500).json({ reply: "API Hatası: " + data.error.message });
    }

    // Cevap yapısını daha esnek kontrol edelim
    const candidate = data.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      res.status(200).json({ reply: candidate.content.parts[0].text });
    } else if (candidate?.finishReason === "SAFETY") {
      res.status(500).json({ reply: "Güvenlik uyarısı: Yazdığın metin Gemini filtrelerine takıldı." });
    } else {
      res.status(500).json({ reply: "Gemini boş cevap döndü. Hata detayı: " + JSON.stringify(data) });
    }

  } catch (err) {
    res.status(500).json({ reply: "Sistem Hatası: " + err.message });
  }
}