const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("GELEN VERİ:", data);

  const adminChatId = process.env.ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.error("ADMIN_CHAT_ID tanımlı değil");
    return res.send("OK");
  }

  const logText =
    "📥 SİTE LOGU:\n\n" + JSON.stringify(data, null, 2);

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: logText.slice(0, 4000),
      }),
    }
  );

  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server çalıştı")
);
