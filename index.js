const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    // ============================
    // 🔹 WHATSAPP AUTO REPLY (SADECE BURASI)
    // ============================
    if (
      data &&
      data.message &&
      typeof data.message.body === "string" &&
      data.message.fromMe === false
    ) {
      const text = data.message.body.toLowerCase().trim();
      const from = data.message.from;

      if (text === "kıldım" || text.includes("kıldım")) {
        fetch("https://app.wawp.net/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: from,
            type: "text",
            message: "Allah kabul etsin 🤲",
            instance_id: process.env.WAWP_INSTANCE_ID,
            access_token: process.env.WAWP_TOKEN
          })
        }).catch(() => {});
      }
    }
    // ============================

    // 🔹 TELEGRAM LOG (AYNEN SENİN KODUN)
    const adminChatId = process.env.ADMIN_CHAT_ID;
    const botToken = process.env.BOT_TOKEN;

    if (adminChatId && botToken) {
      const logText = JSON.stringify(data, null, 2);

      await fetch(
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
    }

    res.send("OK");
  } catch (e) {
    console.error(e);
    res.send("OK");
  }
});

app.listen(process.env.PORT || 3000);
