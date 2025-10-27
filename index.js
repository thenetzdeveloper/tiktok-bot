import express from "express";
import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;
app.get("/api/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });
  try {
    const api = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const data = await api.json();
    if (data && data.data && data.data.play) {
      res.json({
        video: { noWatermark: data.data.play },
        cover: data.data.cover,
        title: data.data.title,
      });
    } else {
      res.status(500).json({ error: "Failed to get video link." });
    }
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Server error while fetching video." });
  }
});
bot.start((ctx) => {
  ctx.reply("🎵 សូមស្វាគមន៏មកកាន់​Netz Tool!\n\n សូមផ្ញើនូវលីង្គ TikTok​ ដើម្បីទាញយកគ្មានជាប់ ​watermark.");
});
bot.on("text", async (ctx) => {
  const url = ctx.message.text.trim();
  if (!url.includes("tiktok.com")) {
    return ctx.reply("⚠️ Please send a valid TikTok link!");
  }
  await ctx.reply("⏳ កំពុងដំណើរការដោនឡូត... សូមរងចាំ.");
  try {
    const api = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const data = await api.json();
    if (data && data.data && data.data.play) {
      await ctx.replyWithVideo({ url: data.data.play }, { caption: "✅ វីដេអូអ្នកនៅទីនេះ អ្នកអាចទាញយកដោយគ្មានជាប់ ​watermark!" });
    } else {
      await ctx.reply("❌ Failed to download the video. Try another link.");
    }
  } catch (err) {
    console.error("Bot Error:", err);
    await ctx.reply("⚠️ Something went wrong while downloading.");
  }
});
bot.launch();
app.listen(PORT, () => console.log(`✅ Server & bot running on port ${PORT}`));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));