const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const body = req.body;

  try {
    // =====================================================
    // ✅ SADECE MESSAGE.ANY
    // =====================================================
    if (
      body.event === "message.any" &&
      body.payload &&
      typeof body.payload.body === "string" &&
      body.payload.fromMe === false
    ) {
      const text = body.payload.body.toLowerCase().trim();

      if (text.includes("kıldım")) {
        // ===============================
        // chatId ÇÖZÜMÜ
        // ===============================
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
          console.log("❌ GEÇERSİZ chatId, gönderilmedi");
          res.send("OK");
          return;
        }

        // ===============================
        // WAWP SEND
        // ===============================
        let statusCode = "NO_RESPONSE";
        let responseBody = "";

        try {
          const url =
            "https://wawp.net/wp-json/awp/v1/send" +
            `?instance_id=${process.env.WAWP_INSTANCE_ID}` +
            `&access_token=${process.env.WAWP_TOKEN}` +
            `&chatId=${encodeURIComponent(chatId)}` +
            `&message=${encodeURIComponent("Allah kabul etsin 🤲")}`;

          const resp = await fetch(url, { method: "POST" });

          statusCode = resp.status;
          responseBody = await resp.text();

          console.log("✅ WAWP STATUS:", statusCode);
        } catch (err) {
          statusCode = "FETCH_ERROR";
          responseBody = err.message;
          console.error("❌ FETCH ERROR:", err.message);
        }

        // ===============================
        // TELEGRAM STATUS (ANLIK)
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
                  `chatId: ${chatId}\n` +
                  `HTTP Status: ${statusCode}\n` +
                  `Response:\n${responseBody}`
              })
            }
          );
        }
      }
    }

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
