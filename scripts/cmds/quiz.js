const axios = require("axios");

const USAGE_LIMIT = 15;
const RESET_TIME = 7 * 60 * 60 * 1000; // 7 hours

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "1.7",
    author: "MAhMUD",
    countDown: 10,
    role: 0,
    category: "🎮 Game",
    guide: {
      en: "{pn} [en/bn] - Play a random quiz in English or Bangla!"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {
      const input = args.join("").toLowerCase() || "bn";
      const category = input === "en" || input === "english" ? "english" : "bangla";

      const userData = await usersData.get(event.senderID) || {};
      const now = Date.now();

      // Setup or reset usage
      if (!userData.quizUsage) {
        userData.quizUsage = {
          count: 0,
          lastReset: now
        };
      }

      if (now - userData.quizUsage.lastReset >= RESET_TIME) {
        userData.quizUsage.count = 0;
        userData.quizUsage.lastReset = now;
      }

      // Limit check
      if (userData.quizUsage.count >= USAGE_LIMIT) {
        const remaining = RESET_TIME - (now - userData.quizUsage.lastReset);
        const mins = Math.ceil(remaining / (60 * 1000));
        return api.sendMessage(
          `⚠️ You can only play this quiz 15 times every 7 hours.\n⏳ Please wait ${mins} more minute(s) before trying again.`,
          event.threadID,
          event.messageID
        );
      }

      userData.quizUsage.count += 1;
      await usersData.set(event.senderID, userData);

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/quiz?category=${category}`);
      const quiz = res.data;

      if (!quiz) {
        return api.sendMessage("❌ No quiz available in this category right now.", event.threadID, event.messageID);
      }

      const { question, correctAnswer, options } = quiz;
      const { a, b, c, d } = options;

      const quizMsg = {
        body: `🎯 𝗤𝘂𝗶𝘇 𝗧𝗶𝗺𝗲!\n━━━━━━━━━━━━━━━━━\n❓ Question: ${question}\n\n🅐 ${a}\n🅑 ${b}\n🅒 ${c}\n🅓 ${d}\n━━━━━━━━━━━━━━━━━\n📩 Reply with the correct option (A / B / C / D)\n!`
      };

      api.sendMessage(quizMsg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 40000);
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("🚨 Failed to fetch quiz! Please try again later.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;

    if (event.senderID !== author) {
      return api.sendMessage("⚠️ This is not your quiz, please wait for your own turn!", event.threadID, event.messageID);
    }

    await api.unsendMessage(Reply.messageID);
    const userAnswer = event.body.trim().toLowerCase();

    if (userAnswer === correctAnswer.toLowerCase()) {
      const rewardCoins = 500;
      const rewardExp = 121;
      const userData = await usersData.get(author);

      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      return api.sendMessage(
        `✅ Correct Answer!\n━━━━━━━━━━━━━━━\n🎉 You earned:\n➤ 💰 ${rewardCoins} Coins\n➤ ✨ ${rewardExp} EXP\n━━━━━━━━━━━━━━━\nGreat job! Keep going!`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ Incorrect Answer.\n━━━━━━━━━━━━━━━\n✔️ The correct answer was: ${correctAnswer}\n━━━━━━━━━━━━━━━\nTry again next time!`,
        event.threadID,
        event.messageID
      );
    }
  }
};
