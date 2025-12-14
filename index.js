const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const body = req.body;

  try {
    console.log("GELEN EVENT:", body.event);

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
          const resp = await fetch("https://app.wawp.net/api/send", {
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

          statusCode = resp.status;
          responseBody = await resp.text();

          console.log("WAWP SEND STATUS:", statusCode);
          console.log("WAWP SEND BODY:", responseBody);

        } catch (err) {
          statusCode = "FETCH_ERROR";
          responseBody = err.message;
          console.error("WAWP FETCH ERROR:", err.message);
        }

        // ===============================
        // Telegram'a SADECE STATUS gönder
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
