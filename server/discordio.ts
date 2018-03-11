const DiscordIo = require('discord.io');

let TOKEN=process.env.DISCORDWATCHDOG_TOKEN

const SERVER_ID = "407793962527752192"

const BOT_SERVER_EARLY_URL = "http://quiet-tor-66877.herokuapp.com/"
const BOT_SERVER_LATE_URL = "http://rocky-cove-85948.herokuapp.com/"

console.log("TOKEN",TOKEN)

let bot = new DiscordIo.Client({
    token: TOKEN,
    autorun: true
})

console.log("bot initial",bot)

/*
bot.sendMessage({to: channelID, message: Object.values(
    bot.servers[bot.channels[channelID].guild_id].members
).filter(u => u.bot).map(u => "<@"+u.id+">").join(" ")
*/

function getBotServerUrlByDayOfMonth():string{
    let now=new Date()
    let dayOfMonth=now.getDate()
    return dayOfMonth<=20?BOT_SERVER_EARLY_URL:BOT_SERVER_LATE_URL
}

function getOnlineBotUsers():any[]{
    let members=bot.servers[SERVER_ID].members
    return Object.keys(members).map(key=>members[key]).filter((u:any) => u.bot && u.status=="online")
}

function getOnlineBotUsersByName():any{
    let obus=getOnlineBotUsers()
    let byname:any={}
    for(let key in obus){
        let member=obus[key]
        byname[member.username]=member
    }
    return byname
}

function hasServiceBot():boolean{
    let obusbn=getOnlineBotUsersByName()
    if(obusbn["TestBot"]!=undefined) return true
    if(obusbn["DevBot"]!=undefined) return true
    return false
}

bot.on('ready', function() {
    //console.log("bot logged",bot)
    console.log('Logged in as %s - %s\n', bot.username, bot.id)

    console.log("has service bot",hasServiceBot())
})

bot.on('message', function(user:any, userID:any, channelID:any, message:any, event:any) {
    try{
        if (message.length>0){
            let prefix=message.split("")[0]
            if(prefix=="+"){
                console.log("command",user)                
                if(!hasServiceBot()){
                    console.log("no service")
                    let botServerUrl=getBotServerUrlByDayOfMonth()                    
                    let msg=
`Hi **${user}** ! I noticed you are trying to issue a bot command.\n`+
`:exclamation: No bot is online currently to service your command.\n`+
`I'm activating bots ( <${botServerUrl}> ).\n`
                    bot.sendMessage({
                        to: channelID,
                        message: msg
                    })
                    console.log("activating",botServerUrl)                    
                    http.get(botServerUrl,(res:any)=>{
                        const statusCode = res.statusCode
                        console.log("activation result",statusCode)
                        if(statusCode=="200"){
                            msg=`:thumbsup: Bots are up. **Please issue your command now.**`                            
                        }else{
                            msg=`:triangular_flag_on_post: There was a problem activating bots.`
                        }                                               
                        bot.sendMessage({
                            to: channelID,
                            message: msg
                        })
                    })
                }                
            }
        }
    }catch(err){
        console.log(err)
    }    
})