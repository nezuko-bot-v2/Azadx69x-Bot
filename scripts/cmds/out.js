module.exports = {
config: {
name: "out",
version: "1.1",
author: "Azadx69x",
countDown: 5,
role: 2,
shortDescription: {
en: "bot out from group owner only"
},
longDescription: {
en: "out the bot from the group"
},
category: "owner",
guide: {
en: "just type: out"
}
},

onStart: async function ({ api, message, event }) {
const ownerIDs = ["61578365162382"];

if (!ownerIDs.includes(event.senderID)) {
return api.sendMessage(
"Khanakiar pola,tui ke re ? 🤬",
event.threadID,
event.messageID
);
}

api.sendMessage("azad vai bollo left nite tai ami ar thakte parbo na bye Allah Hafez,👋🙂", event.threadID, () => {
setTimeout(() => {
api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
}, 2000);
});

}
};
