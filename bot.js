import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔐 Log in via Privado ID", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "Login",
          web_app: {
            url: "https://myloginpage-production.up.railway.app/telegram.html"
          }
        }
      ]]
    }
  });
});

bot.on("message", (msg) => {
  if (msg.web_app_data?.data) {
    const data = JSON.parse(msg.web_app_data.data);
    bot.sendMessage(msg.chat.id, `✅ Verified!\nName: ${data.name}\nProgram: ${data.programName}`);
  }
});
