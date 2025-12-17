const express = require("express");
const fetch = require("node-fetch");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// ==============================
// PostgreSQL bağlantısı
// ==============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ==============================
// OTOMATİK TABLO OLUŞTURMA
// ==============================
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS triggers (
        id SERIAL PRIMARY KEY,
        keyword TEXT NOT NULL,
        reply TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ triggers tablosu hazır");
  } catch (err) {
    console.error("❌ DB INIT HATASI:", err.message);
  }
})();

// ==============================
// WEBHOOK
// ==============================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  try {
    if (
      body.event !== "message.any" ||
      !body.payload ||
      typeof body.payload.body !== "string" ||
      body.payload.fromMe === true
    ) {
      return res.send("OK");
    }

    const text = body.payload.body.toLowerCase().trim();

    // ==============================
    // TRIGGER'LARI DB'DEN AL
    // ==============================
    const result = await pool.query(
      "SELECT keyword, reply FROM triggers WHERE active = true"
    );

    for (const trigger of result.rows) {
      if (!text.includes(trigger.keyword)) continue;

      // ==============================
      // chatId çözümü
      // ==============================
      const rawFrom = body.payload.from;
      const senderAlt = body.payload._data?.Info?.SenderAlt;

      let chatId = null;

      if (senderAlt && senderAlt.endsWith("@s.whatsapp.net")) {
        chatId = senderAlt.replace("@s.whatsapp.net", "@c.us");
      } else if (
        rawFrom.endsWith("@c.us") ||
        rawFrom.endsWith("@g.us")
      ) {
        chatId = rawFrom;
      }

      if (!chatId) {
        console.log("❌ chatId çözülemedi");
        break;
      }

      // ==============================
      // WAWP SEND
      // ==============================
      try {
        const url =
          "https://wawp.net/wp-json/awp/v1/send" +
          `?instance_id=${process.env.WAWP_INSTANCE_ID}` +
          `&access_token=${process.env.WAWP_TOKEN}` +
          `&chatId=${encodeURIComponent(chatId)}` +
          `&message=${encodeURIComponent(trigger.reply)}`;

        await fetch(url, { method: "POST" });
      } catch (err) {
        console.error("❌ WAWP HATASI:", err.message);
      }

      // ==============================
      // TELEGRAM LOG
      // ==============================
      if (process.env.BOT_TOKEN && process.env.ADMIN_CHAT_ID) {
        await fetch(
          `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: process.env.ADMIN_CHAT_ID,
              text:
                `🟢 AUTO REPLY\n\n` +
                `Kelime: ${trigger.keyword}\n` +
                `Cevap: ${trigger.reply}`
            })
          }
        );
      }

      break;
    }

    res.send("OK");
  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);
    res.send("OK");
  }
});

app.get("/", (req, res) => res.send("OK"));

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Webhook çalışıyor");
});
