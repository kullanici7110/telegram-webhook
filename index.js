const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ------------------ WhatsApp gönderme fonksiyonu ------------------
async function sendWhatsapp(chatId, message) {
  const instanceId = process.env.INSTANCE_ID;
  const accessToken = process.env.ACCESS_TOKEN;

  if (!instanceId || !accessToken) {
    console.error("INSTANCE_ID veya ACCESS_TOKEN tanımlı değil");
    return;
  }

  await fetch("https://wawp.net/wp-json/awp/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instance_id: instanceId,
      access_token: accessToken,
      chatId: chatId,
      message: message,
    }),
  });
}

// ------------------ WEBHOOK ------------------
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    // Gelen veriyi logla
    console.log("GELEN VERİ (JSON):", JSON.stringify(data, null, 2));

    const adminChatId = process.env.ADMIN_CHAT_ID;
    const botToken = process.env.BOT_TOKEN;

    if (!adminChatId || !botToken) {
      console.error("ADMIN_CHAT_ID veya BOT_TOKEN tanımlı değil");
    }

    // WAWP payload alanları
    const { metadata, me, message, event, timestamp, environment } = data;

    // -------- SELAM → SELAM MANTIĞI --------
    const incomingText = message?.body?.trim().toLowerCase();
    const fromChatId = message?.from;

    if (incomingText === "kıldım" && fromChatId) {
      await sendWhatsapp(fromChatId, "selam");
    }

    // -------- TELEGRAM LOG --------
    const filteredData = {
      event,
      timestamp,
      user: metadata,
      me,
      message,
      environment,
    };

    const logText = JSON.stringify(filteredData, null, 2);

    if (adminChatId && botToken) {
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
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook işlem hatası:", err);
    res.status(500).send("Hata");
  }
});

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => {
  res.send("OK");
});

// ------------------ SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalıştı:", PORT);
});
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
