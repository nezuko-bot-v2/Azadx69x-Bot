const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    version: "1.1",
    author: "Azadx69x",//Author change korle tor marechudi 
    shortDescription: "Slot Machine + VIP + Limit",
    category: "game"
  },

  onStart: async function ({ message, event, args }) {

    const DB = path.join(__dirname, "slotdb.json");
    let db = fs.existsSync(DB)
      ? JSON.parse(fs.readFileSync(DB))
      : { users: {} };

    function save() {
      fs.writeFileSync(DB, JSON.stringify(db, null, 2));
    }

    const uid = event.senderID;
    
    if (!db.users[uid]) {
      db.users[uid] = {
        coins: 1000,
        wins: 0,
        loss: 0,
        spinUsed: 0,
        spinReset: Math.floor(Date.now() / 1000),
        vip: false
      };
      save();
    }

    const user = db.users[uid];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⭐ ADMIN VIP CONTROL ⭐ ━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const ADMIN = "YOUR_ADMIN_UID_HERE";

    if (args[0] === "vip" && args[1] === "add") {
      if (uid !== ADMIN)
        return message.reply("⛔❌ You are not admin!");

      const target = args[2];
      if (!db.users[target]) return message.reply("😢 User not found!");

      db.users[target].vip = true;
      save();
      return message.reply(`🌟 VIP Added → ${target}`);
    }

    if (args[0] === "vip" && args[1] === "remove") {
      if (uid !== ADMIN)
        return message.reply("⛔❌ You are not admin!");

      const target = args[2];
      if (!db.users[target]) return message.reply("😢 User not found!");

      db.users[target].vip = false;
      save();
      return message.reply(`⚠️ VIP Removed → ${target}`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 👤 USER PROFILE (slot me) ━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (args[0] === "me" || args[0] === "list") {
      const now = Math.floor(Date.now() / 1000);
      const resetIn = (user.spinReset + 7 * 3600) - now;

      const h = Math.floor(resetIn / 3600);
      const m = Math.floor((resetIn % 3600) / 60);

      const maxSpin = user.vip ? 100 : 50;

      return message.reply(
`┏━━━━━━━━━━━━━━━━━━━━┓
┃ 👤 *YOUR PROFILE*
┣━━━━━━━━━━━━━━━━━━━━┫
┃ 💰 Coins: ${user.coins}
┃ 🏆 Wins: ${user.wins}
┃ 💔 Loss: ${user.loss}
┃ 🌟 VIP: ${user.vip ? "✔ Yes" : "❌ No"}
┃ 🎯 Spins: ${user.spinUsed}/${maxSpin}
┃ ⏳ Reset In: ${h}h ${m}m
┗━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    if (args[0] === "vip") {
      return message.reply(
`┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🌟 *VIP INFO*
┣━━━━━━━━━━━━━━━━━━━━┫
┃ ⭐ Status: ${user.vip ? "VIP User" : "Normal User"}
┃ 🎰 Spin Limit: ${user.vip ? "100 / 7h" : "50 / 7h"}
┗━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🎰 SLOT GAME START ━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const bet = parseInt(args[0]);
    if (!bet || bet <= 0)
      return message.reply("⚠️ Example: )slot 50");

    if (user.coins < bet)
      return message.reply("❌ Not enough coins!");

    const now = Math.floor(Date.now() / 1000);

    if (now - user.spinReset >= 7 * 3600) {
      user.spinReset = now;
      user.spinUsed = 0;
      save();
    }

    const maxSpin = user.vip ? 100 : 50;

    if (user.spinUsed >= maxSpin) {
      return message.reply(
`⛔ *Spin limit reached!*
⏳ Wait 7 hours.
🎯 Used: ${user.spinUsed}/${maxSpin}`
      );
    }

    user.spinUsed++;
    save();
    
    const symbols = [
      "🍒","🍋","⭐","7️⃣","🍇","🍉","🍓",
      "🍍","🥝","🍌","🍑","🥥","🥭",
      "💎","🔔","🍀","🌈","❤️","🔥","⚡",
      "🎱","🎁","👑","🧨","🪙"
    ];

    const r = () => symbols[Math.floor(Math.random() * symbols.length)];
    
    const spin1 = `${r()} | ${r()} | ${r()}`;
    await message.reply(`🎰 *Spinning...* 🔄\n${spin1}\n⏳ Loading...`);

    await new Promise(res => setTimeout(res, 900));

    const spin2 = `${r()} | ${r()} | ${r()}`;
    await message.reply(`🎰 *Still spinning...* 🔁\n${spin2}`);

    await new Promise(res => setTimeout(res, 1000));

    const a = r(), b = r(), c = r();

    let result = "";
    let win = 0;

    if (a === b && b === c) {
      result = "🎉 **JACKPOT!** 🎉";
      win = bet * 7;
    } else if (a === b || b === c || a === c) {
      result = "✨ *PAIR!* ✨";
      win = bet * 2;
    } else {
      result = "❌ *LOSE!*";
      win = 0;
    }

    if (win > 0) {
      user.coins += win;
      user.wins++;
    } else {
      user.coins -= bet;
      user.loss++;
    }

    save();

    return message.reply(
`┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎰 *FINAL RESULT*
┣━━━━━━━━━━━━━━━━━━━━┫
┃ ${a} | ${b} | ${c}
┃
┃ 🎯 Result: ${result}
┃ 💵 Bet: ${bet}
┃ 🏆 Win: ${win}
┃ 💰 Balance: ${user.coins}
┃ 🔄 Spins: ${user.spinUsed}/${maxSpin}
┗━━━━━━━━━━━━━━━━━━━━┛`
    );
  }
};
