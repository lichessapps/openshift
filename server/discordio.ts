const DiscordIo = require('discord.io');

let TOKEN=process.env.DISCORDWATCHDOG_TOKEN

const SERVER_ID = "407793962527752192"

const BOT_SERVER_MAIN_URL = "http://quiet-tor-66877.herokuapp.com/"
const BOT_SERVER_RESERVE_URL = "http://rocky-cove-85948.herokuapp.com/"

console.log("TOKEN",TOKEN)

let bot = new DiscordIo.Client({
    token: TOKEN,
    autorun: true
})

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
    console.log('logged in as %s - %s', bot.username, bot.id)

    console.log("service bot",hasServiceBot()?"avaialable":"not available")
})

bot.on('message', function(user:any, userID:any, channelID:any, message:any, event:any) {
    try{
        if (message.length>0){
            let prefix=message.split("")[0]
            if(prefix=="+"){
                let parts=message.substring(1).split(" ")
                let command=parts[0]
                let args=[]
                if(parts.length>1){
                    parts.shift()
                    args=parts
                }
                console.log("user",user,"command",command,"args",args)                
                if(command=="ping"){
                    bot.sendMessage({
                        to: channelID,
                        message: "pong"
                    })
                }else if(!hasServiceBot()){
                    console.log("no service")
                    let msg=`Hi **${user}** ! Noticed you are trying to issue a bot command.\n`+
                        `:exclamation: No bot is online currently to service your command.\n`+
                        `Activating main bots ( <${BOT_SERVER_MAIN_URL}> ) .\n`
                    bot.sendMessage({
                        to: channelID,
                        message: msg
                    })
                    console.log("activating",BOT_SERVER_MAIN_URL)                    
                    http.get(BOT_SERVER_MAIN_URL,(res:any)=>{
                        let statusCode = res.statusCode                        
                        console.log("main bot activation result",statusCode)
                        if(statusCode=="200"){
                            msg=`:thumbsup: Main bots are up. **You can issue commands now.**`                            
                            bot.sendMessage({
                                to: channelID,
                                message: msg
                            })
                            bot.sendMessage({
                                to: channelID,
                                message: message
                            })
                        }else{
                            msg=`:triangular_flag_on_post: There was a problem activating main bot.\n`+
                                `Falling back to reserve bot ( <${BOT_SERVER_RESERVE_URL}> ) .`
                            bot.sendMessage({
                                to: channelID,
                                message: msg
                            })
                            http.get(BOT_SERVER_RESERVE_URL,(res:any)=>{
                                let statusCode = res.statusCode                                
                                console.log("reserve bot activation result",statusCode)
                                if(statusCode=="200"){
                                    msg=`:thumbsup: Reserve bot is up. **You can issue commands now.**`                            
                                    bot.sendMessage({
                                        to: channelID,
                                        message: msg
                                    })
                                    bot.sendMessage({
                                        to: channelID,
                                        message: message
                                    })
                                }else{
                                    msg=`:triangular_flag_on_post: There was a problem activating reserve bot.\n`+
                                        `Please contact the system admin.`
                                    bot.sendMessage({
                                        to: channelID,
                                        message: msg
                                    })
                                }
                            })
                        }                                                                       
                    })
                }                
            }
        }
    }catch(err){
        console.log(err)
    }    
})