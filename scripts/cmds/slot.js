module.exports = {
  config: {
    name: "slot",
    aliases: ["slots", "st"],
    version: "2.0",
    author: "Azadx69x",//Author change korle tor marechudi 
    role: 0,
    category: "game",
    description: "No-prefix slot machine"
  },
  
  onChat: async function ({ event, message, usersData }) {
    const text = event.body?.trim();
    if (!text) return;
    
    const cmd = text.split(" ")[0].toLowerCase();
    const bet = parseInt(text.split(" ")[1]);

    if (!["slot", "slots", "spin"].includes(cmd)) return;
    if (isNaN(bet) || bet <= 0) 
      return message.reply("⚠ Bet amount lagbe!");

    return this.runGame({ event, message, usersData, bet });
  },
  
  onStart: async function ({ event, message, args, usersData }) {
    const bet = parseInt(args[0]);
    if (!bet) return message.reply("⚠ Bet amount de!");
    return this.runGame({ event, message, usersData, bet });
  },
  
  runGame: async function ({ event, message, usersData, bet }) {
    const uid = event.senderID;
    const user = await usersData.get(uid);

    if (user.money < bet)
      return message.reply(`❌ Not enough coins!\n💰 You have: ${user.money}`);

    const symbols = ["🍒","🍋","🍉","🍇","⭐","7️⃣","🍊","🥝","🔔","💎","🍀"];
    const roll = () => symbols[Math.floor(Math.random() * symbols.length)];

    const a = roll(), b = roll(), c = roll();
    let win = 0;
    let msg = "";

    const luck = Math.random();

    if (a === b && b === c && luck < 0.05) {
      win = bet * 10;
      msg = "🔥 JACKPOT!";
    } 
    else if (a === b && b === c) {
      win = bet * 5;
      msg = "💰 Triple Match!";
    }
    else if (a === b || b === c || a === c) {
      win = bet * 2;
      msg = "✨ Double Match!";
    }
    else if (luck < 0.50) {
      win = Math.floor(bet * 1.2);
      msg = "🍀 Lucky Win!";
    }
    else {
      win = -bet;
      msg = "💸 You Lost!";
    }

    const final = user.money + win;
    await usersData.set(uid, { money: final });

    return message.reply(
`🎰 SLOT MACHINE
━━━━━━━━━━━━━━
${a} | ${b} | ${c}
━━━━━━━━━━━━━━
${msg}
${win >= 0 ? "🟢 Won:" : "🔴 Lost:"} ${win}
💰 Balance: ${final}`
    );
  }
};
