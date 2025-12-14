const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const body = req.body;

  try {
    // =====================================================
    // ✅ WHATSAPP AUTO REPLY + ANLIK STATUS
    // =====================================================
    if (
      body.event === "message.any" &&
      body.payload &&
      typeof body.payload.body === "string" &&
      body.payload.fromMe === false
    ) {
      const text = body.payload.body.toLowerCase().trim();
      const from = body.payload.from;

      if (text.includes("kıldım")) {
        let statusCode = "NO_RESPONSE";
        let responseBody = "";

        try {
          const url =
            "https://wawp.net/wp-json/awp/v1/send" +
            `?instance_id=${process.env.WAWP_INSTANCE_ID}` +
            `&access_token=${process.env.WAWP_TOKEN}` +
            `&chatId=${encodeURIComponent(from)}` +
            `&message=${encodeURIComponent("Allah kabul etsin 🤲")}`;

          const resp = await fetch(url, { method: "POST" });

          statusCode = resp.status;
          responseBody = await resp.text();

          console.log("WAWP STATUS:", statusCode);
          console.log("WAWP RESPONSE:", responseBody);

        } catch (err) {
          statusCode = "FETCH_ERROR";
          responseBody = err.message;
          console.error("WAWP FETCH ERROR:", err.message);
        }

        // ===============================
        // Telegram'a SADECE STATUS
        // ===============================
        if (process.env.ADMIN_CHAT_ID && process.env.BOT_TOKEN) {
          await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: process.env.ADMIN_CHAT_ID,
                text:
                  `🟢 AUTO REPLY STATUS\n\n` +
                  `Mesaj: "kıldım"\n` +
                  `Gönderilen: Allah kabul etsin 🤲\n\n` +
                  `HTTP Status: ${statusCode}\n` +
                  `Response:\n${responseBody}`
              })
            }
          );
        }
      }
    }
    // =====================================================

    res.send("OK");
  } catch (err) {
    console.error("WEBHOOK GENEL HATA:", err);
    res.send("OK");
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server çalışıyor:", process.env.PORT || 3000);
});
