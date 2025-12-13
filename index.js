const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  console.log("GELEN VERİ:", req.body);

  const message = req.body.message;
  if (message && message.text) {
    const chatId = message.chat.id;

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Mesajını aldım ✅",
      }),
    });
  }

  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("Bot çalışıyor");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server çalıştı")
);
