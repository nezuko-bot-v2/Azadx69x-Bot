const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
    config: {
        name: "join",
        version: "1.3",
        author: "Azadx69x",
        countDown: 5,
        role: 0,
        shortDescription: "Join the group that bot is in",
        longDescription: "",
        category: "owner",
        guide: { en: "{p}{n}" }
    },

    onStart: async function ({ api, event }) {
        try {
            const list = await api.getThreadList(100, null, ["INBOX"]);
            const groups = list.filter(g => g.isGroup || g.threadName);

            if (!groups.length) {
                api.sendMessage("⚠️ No group chats found that the bot can access.", event.threadID);
                return;
            }

            const formatted = groups.map((g, i) =>
`│ 🌟 ${i + 1}. ${g.threadName || "Unnamed Group"}
│ 🆔 ID: ${g.threadID}
│ 👥 Members: ${g.participantIDs ? g.participantIDs.length : "Unknown"}`).join("\n│──────────────────────────\n");

            const msg =
`╔═══════════════════════════════╗
║       ✨ PREMIUM GROUP LIST ✨ ║
╠═══════════════════════════════╣
│───────────────────────────────
${formatted}
│───────────────────────────────
╚═══════════════════════════════╝

📌 Reply with the number of the group to join!`;

            const sent = await api.sendMessage(msg, event.threadID);

            global.GoatBot.onReply.set(sent.messageID, {
                commandName: "join",
                messageID: sent.messageID,
                author: event.senderID
            });

        } catch (e) {
            console.error("Join command onStart error:", e);
            const errMsg = e && e.message ? e.message : JSON.stringify(e);
            api.sendMessage(`⚠️ Failed to fetch groups: ${errMsg}`, event.threadID);
        }
    },

    onReply: async function ({ api, event, Reply, args }) {
        if (event.senderID !== Reply.author) return;

        const num = parseInt(args[0]);
        if (isNaN(num) || num <= 0) {
            api.sendMessage("⚠️ Invalid number.", event.threadID, event.messageID);
            return;
        }

        try {
            const list = await api.getThreadList(100, null, ["INBOX"]);
            const groups = list.filter(g => g.isGroup || g.threadName);

            if (num > groups.length) {
                api.sendMessage("⚠️ Group number out of range.", event.threadID, event.messageID);
                return;
            }

            const g = groups[num - 1];
            const info = await api.getThreadInfo(g.threadID);
            console.log("Thread info:", info);

            if (!info.participantIDs) {
                throw new Error("Failed to get participants list.");
            }

            if (info.participantIDs.includes(event.senderID)) {
                api.sendMessage(
`╔═══════════════════════╗
║ ❌ ALREADY IN GROUP ❌ ║
╚═══════════════════════╝
Group: ${g.threadName || "Unnamed Group"}`, event.threadID, event.messageID);
                return;
            }

            if (info.participantIDs.length >= 250) {
                api.sendMessage(
`╔═══════════════════════╗
║ 🚫 GROUP FULL 🚫       ║
╚═══════════════════════╝
Group: ${g.threadName || "Unnamed Group"}`, event.threadID, event.messageID);
                return;
            }

            try {
                await api.addUserToGroup([event.senderID], g.threadID);

                api.sendMessage(
`╔═══════════════════════╗
║ ✅ JOINED GROUP ✅       ║
╚═══════════════════════╝
Group: ${g.threadName || "Unnamed Group"}`, event.threadID, event.messageID);

            } catch (errAdd) {
                console.error("Failed to add user to group:", errAdd);
                api.sendMessage(
`⚠️ Cannot add you automatically. 
Make sure the bot is admin or manually add yourself.
Group: ${g.threadName || "Unnamed Group"}`, event.threadID, event.messageID);
            }

        } catch (e) {
            console.error("Join command onReply error:", e);
            const errMsg = e && e.message ? e.message : JSON.stringify(e);
            api.sendMessage(`⚠️ Error occurred: ${errMsg}`, event.threadID, event.messageID);
        } finally {
            global.GoatBot.onReply.delete(event.messageID);
        }
    },
};
