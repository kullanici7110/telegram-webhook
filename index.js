// index.js
// TEMİZ + ÇALIŞAN SÜRÜM
// Node.js v22 / Render / CommonJS uyumlu
// Telegram log + WhatsApp "selam" → "selam"

const express = require("express");
const app = express();

// CommonJS için fetch (node-fetch)
const fetch = (...args) => import("node-fetch").then(m => m.default(...args));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Telegram env
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

// WhatsApp (WAWP) env
const INSTANCE_ID = process.env.INSTANCE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// WhatsApp mesaj gönderme
async function sendWhatsApp(chatId, message) {
  const res = await fetch("https://wawp.net/wp-json/awp/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      instance_id: INSTANCE_ID,
      access_token: ACCESS_TOKEN,
      chatId: chatId,
      message: message,
    }),
  });

  return res.status;
}

// WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("GELEN VERİ:", JSON.stringify(data, null, 2));

    /* -------- TELEGRAM LOG -------- */
    if (ADMIN_CHAT_ID && BOT_TOKEN) {
      const filteredData = {
        event: data.event,
        timestamp: data.timestamp,
        user: data.metadata,
        me: data.me,
        message: data.payload,
        environment: data.environment,
      };

      const logText = JSON.stringify(filteredData, null, 2);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: "```\n" + logText.slice(0, 4000) + "\n```",
          parse_mode: "Markdown",
        }),
      });
    }

    /* -------- WHATSAPP AUTO REPLY -------- */
    if (data && data.message && data.message.fromMe === false) {
      const text = String(data.message.body || "").toLowerCase().trim();
      const chatId = data.message.from;

      if (text === "selam" && INSTANCE_ID && ACCESS_TOKEN) {
        await sendWhatsApp(chatId, "selam");
      }
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook hata:", err);
    res.status(500).send("ERR");
  }
});

app.get("/", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});  return res.status;
}

// Webhook handler (ASYNC)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("GELEN VERİ:", JSON.stringify(data, null, 2));

    /* -------- TELEGRAM LOG -------- */
    if (ADMIN_CHAT_ID && BOT_TOKEN) {
      const { metadata, me, payload, event, timestamp, environment } = data;

      const filteredData = {
        event,
        timestamp,
        user: metadata,
        me,
        message: payload,
        environment,
      };

      const logText = JSON.stringify(filteredData, null, 2);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: "```\n" + logText.slice(0, 4000) + "\n```",
          parse_mode: "Markdown",
        }),
      });
    }

    /* -------- WHATSAPP AUTO REPLY -------- */
    if (data && data.message && data.message.fromMe === false) {
      const text = String(data.message.body || "").toLowerCase().trim();
      const fromChatId = data.message.from;

      if (text === "kıldım" && INSTANCE_ID && ACCESS_TOKEN) {
        // await ASYNC handler içinde -> HATA YOK
        await sendWhatsApp(fromChatId, "Allah kabul etsin.");
      }
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook hata:", err);
    res.status(500).send("ERR");
  }
});

app.get("/", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});          parse_mode: "Markdown",
        }),
      });
    }

    /* ---------------- WHATSAPP AUTO REPLY ---------------- */
    if (
      data?.message &&
      data.message.fromMe === false &&
      INSTANCE_ID &&
      ACCESS_TOKEN
    ) {
      const text = String(data.message.body || "").toLowerCase().trim();
      const chatId = data.message.from;

      if (text === "selam") {
        await sendWhatsApp(chatId, "selam");
      }
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook işlem hatası:", err);
    res.status(500).send("Hata");
  }
});

app.get("/", (req, res) => res.send("OK"));

app.listen(PORT, () => {
  console.log("Server çalıştı:", PORT);
});    const adminChatId = process.env.ADMIN_CHAT_ID;
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
