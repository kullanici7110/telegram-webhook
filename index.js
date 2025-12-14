const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    // Console log için düzenli JSON
    console.log("GELEN VERİ (JSON):", JSON.stringify(data, null, 2));

    const adminChatId = process.env.ADMIN_CHAT_ID;
    const botToken = process.env.BOT_TOKEN;

    if (!adminChatId || !botToken) {
      console.error("ADMIN_CHAT_ID veya BOT_TOKEN tanımlı değil");
      return res.send("OK");
    }

    // Senin JSON yapına birebir
    const { metadata, me, message, event, timestamp, environment } = data;

    const filteredData = {
      event,
      timestamp,
      user: metadata,
      me,
      message,
      environment,
    };

    // --------------------------------------------------
    // ✅ WAWP / WhatsApp TETİKLEYİCİ (KILDIM)
    // --------------------------------------------------
    if (message && message.body) {

      const text = message.body.toLowerCase().trim();
      const from = message.from;

      // 🔒 Kendi gönderdiğimiz mesajlara cevap verme
      if (message.fromMe === true) {
        return res.send("OK");
      }

      // 🎯 Tetikleyici
      if (text === "kıldım" || text.includes("kıldım")) {

        await fetch("https://app.wawp.net/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: from,
            type: "text",
            message: "Allah kabul etsin 🤲",
            instance_id: process.env.WAWP_INSTANCE_ID,
            access_token: process.env.WAWP_TOKEN
          })
        });
      }
    }
    // --------------------------------------------------

    // Telegram'a log gönder (AYNI KALDI)
    const logText = JSON.stringify(filteredData, null, 2);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: "```\n" + logText.slice(0, 4000) + "\n```",
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram gönderim hatası:", errorText);
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook işlem hatası:", err);
    res.status(500).send("Hata");
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server çalıştı:", process.env.PORT || 3000)
);
