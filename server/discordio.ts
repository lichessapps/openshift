const DiscordIo = require('discord.io');

let TOKEN=process.env.DISCORDWATCHDOG_TOKEN

console.log("TOKEN",TOKEN)

let bot = new DiscordIo.Client({
    token: TOKEN,
    autorun: true
})

console.log("bot",bot)

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
})

bot.on('message', function(user:any, userID:any, channelID:any, message:any, event:any) {
    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        })
    }
})