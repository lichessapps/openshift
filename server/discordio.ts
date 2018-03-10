const DiscordIo = require('discord.io');

let TOKEN=process.env.DISCORDWATCHDOG_TOKEN

console.log("TOKEN",TOKEN)

let bot = new DiscordIo.Client({
    token: TOKEN,
    autorun: true
})

console.log("bot initial",bot)

bot.on('ready', function() {
    //console.log("bot logged",bot)
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
})

bot.on('message', function(user:any, userID:any, channelID:any, message:any, event:any) {
    try{
        if (message.length>0){
            let prefix=message.split("")[0]
            if(prefix=="+"){
                console.log("command",user)
                let msg=
`Hi there **${user}** ! I'm **WatchDog** applied to monitor bot commands. `+
`It looks as if you are trying to issue a bot command. `+
`If you got your expected response, then fine. If not, the reason may be that bot servers are not running. `+
`If you don't see **AtomBot**, **TestBot** or **DevBot** listed being online, the please refer to the **#activatebots** channel, to wake them up. `+
`When bots are up, try to issue your command again. `+
`If it still does not work, the command format may have been wrong. `+
`In this case refer to the **#faq** channel for available commands. `+
`Regards, **WatchDog**. `
                bot.sendMessage({
                    to: channelID,
                    message: msg
                })
            }
        }
    }catch(err){
        console.log(err)
    }    
})