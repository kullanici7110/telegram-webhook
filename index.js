// index.js
// GARANTİLİ ÇALIŞAN – SYNTAX TEMİZ
// Node.js v22 / Render / CommonJS

const express = require("express");
const app = express();

// CommonJS fetch
const fetch = (...args) => import("node-fetch").then(m => m.default(...args));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ENV
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const INSTANCE_ID = process.env.INSTANCE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

async function sendWhatsApp(chatId, message) {
  const res = await fetch("https://wawp.net/wp-json/awp/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      instance_id: INSTANCE_ID,
      access_token: ACCESS_TOKEN,
      chatId: chatId,
      message: message
    })
  });
  return res.status;
}

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("GELEN:", JSON.stringify(data, null, 2));

    // TELEGRAM LOG
    if (ADMIN_CHAT_ID && BOT_TOKEN) {
      const logText = JSON.stringify({
        event: data.event,
        timestamp: data.timestamp,
        user: data.metadata,
        me: data.me,
        message: data.payload
      }, null, 2);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: "```\n" + logText.slice(0, 4000) + "\n```",
          parse_mode: "Markdown"
        })
      });
    }

    // WHATSAPP AUTO REPLY
    if (data && data.message && data.message.fromMe === false) {
      const text = String(data.message.body || "").toLowerCase().trim();
      const chatId = data.message.from;

      if (text === "selam" && INSTANCE_ID && ACCESS_TOKEN) {
        await sendWhatsApp(chatId, "selam");
      }
    }

    res.send("OK");
  } catch (err) {
    console.error("HATA:", err);
    res.status(500).send("ERR");
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
