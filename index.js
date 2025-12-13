const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    console.log("GELEN VERİ (JSON):", JSON.stringify(data)); // Tam JSON log

    const adminChatId = process.env.ADMIN_CHAT_ID;
    const botToken = process.env.BOT_TOKEN;

    if (!adminChatId || !botToken) {
      console.error("ADMIN_CHAT_ID veya BOT_TOKEN tanımlı değil");
      return res.send("OK");
    }

    // JSON'u string olarak gönderiyoruz
    const logText = JSON.stringify(data);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: "```\n" + logText.slice(0, 4000) + "\n```", // Telegram kod bloğu ile JSON formatında
          parse_mode: "Markdown"
        }),
      }
    );

    if (!response.ok) {
      console.error("Telegram gönderim hatası:", await response.text());
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook işlem hatası:", err);
    res.status(500).send("Hata");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server çalıştı:", process.env.PORT || 3000)
);
