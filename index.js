const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("GELEN VERİ:", data);

  // Telegram'dan gelen mesaj varsa
  if (data.message && data.message.chat && data.message.chat.id) {
    const chatId = data.message.chat.id;

    // Logu string'e çevir (Telegram mesajı için)
    const logText = "📥 GELEN LOG:\n\n" + JSON.stringify(data, null, 2);

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: logText.slice(0, 4000) // Telegram limit
        }),
      }
    );
  }

  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("Bot çalışıyor");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server çalıştı")
);
