"use strict";
// system
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const path = require('path');
const fetch_ = require('node-fetch');
const FormData_ = require('form-data');
const fs = require("fs");
const schedule = require('node-schedule');
const PORT = 8080;
function isProd() {
    return (process.env.DISCORD_LOCAL == undefined);
}
function isDev() {
    return !isProd();
}
console.log(`application started in ${isProd() ? "production" : "development"} mode`);
let LICHESS_USER = process.env.LICHESS_USER || "";
let LICHESS_PASS = process.env.LICHESS_PASS || "";
function login(user, pass, callback) {
    console.log(`lichess login in with ${user}`);
    let form = new FormData_();
    form.append("username", user);
    form.append("password", pass);
    fetch_((`https://lichess.org/login?referrer=/`), {
        method: "POST",
        headers: {
            "Referer": "https://lichess.org/login?referrer=/"
        },
        redirect: "manual",
        body: form
    }).then((response) => {
        console.log("response", response.headers.get("set-cookie"));
        let cookie = response.headers.get("set-cookie");
        let parts = cookie.split("=");
        parts.shift();
        parts = parts.join("=").split(";");
        let lila2 = parts[0];
        console.log(`obtained cookie: lila2=${lila2}`);
        callback(lila2);
    });
}
let LICHESS_TOURNEY_URL = `https://lichess.org/tournament/new`;
let LICHESS_TOURNEY_NAME = `ACT Discord Server`;
let LICHESS_TOURNEY_WAIT_MINUTES = `20`;
function createTourney(lila2, time, inc, callback) {
    console.log(`creating atomic tourney ${time}+${inc}`);
    let form = new FormData_();
    form.append("system", "1");
    //form.append("isprivate","");
    form.append("password", "");
    form.append("name", `${LICHESS_TOURNEY_NAME}`);
    form.append("variant", "7");
    form.append("position", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    form.append("mode", "1");
    form.append("waitMinutes", `${LICHESS_TOURNEY_WAIT_MINUTES}`);
    form.append("clockTime", `${time}`);
    form.append("clockIncrement", `${inc}`);
    form.append("minutes", "120");
    //console.log(form)
    let headers = {
        "Referer": `${LICHESS_TOURNEY_URL}`,
        'Cookie': `lila2=${lila2}`
    };
    //console.log(headers);
    fetch_((`${LICHESS_TOURNEY_URL}`), {
        method: "POST",
        headers: headers,
        redirect: "manual",
        body: form
    }).
        then((response) => response.text()).
        then((content) => callback(content));
}
let TOURNEY_SCHEDULE = {
    0: [1, 0],
    10: [3, 2],
    20: [2, 0],
    30: [5, 0],
    40: [1, 0],
    50: [3, 0]
};
function scheduleTourneys() {
    for (let key in TOURNEY_SCHEDULE) {
        let value = TOURNEY_SCHEDULE[key];
        let time = value[0];
        let inc = value[1];
        console.log(`scheduler schedule tourney ${key} ${time} ${inc}`);
        schedule.scheduleJob(`${key} * * * *`, function () {
            console.log(`scheduler create tourney ${time} ${inc}`);
            login(LICHESS_USER, LICHESS_PASS, (lila2) => {
                console.log(`login ok`);
                createTourney(lila2, time, inc, (content) => {
                    //console.log(content)
                });
            });
        });
    }
}
if (isProd())
    scheduleTourneys();
const DiscordIo = require('discord.io');
let TOKEN = process.env.DISCORDWATCHDOG_TOKEN;
const SERVER_ID = "407793962527752192";
const BOT_SERVER_MAIN_URL = "http://quiet-tor-66877.herokuapp.com/";
const BOT_SERVER_RESERVE_URL = "http://rocky-cove-85948.herokuapp.com/";
console.log("TOKEN", TOKEN);
let bot = new DiscordIo.Client({
    token: TOKEN,
    autorun: true
});
function getOnlineBotUsers() {
    let members = bot.servers[SERVER_ID].members;
    return Object.keys(members).map(key => members[key]).filter((u) => u.bot && u.status == "online");
}
function getOnlineBotUsersByName() {
    let obus = getOnlineBotUsers();
    let byname = {};
    for (let key in obus) {
        let member = obus[key];
        byname[member.username] = member;
    }
    return byname;
}
function hasServiceBot() {
    let obusbn = getOnlineBotUsersByName();
    if (obusbn["TestBot"] != undefined)
        return true;
    if (obusbn["DevBot"] != undefined)
        return true;
    return false;
}
bot.on('ready', function () {
    console.log('logged in as %s - %s', bot.username, bot.id);
    console.log("service bot", hasServiceBot() ? "avaialable" : "not available");
});
bot.on('message', function (user, userID, channelID, message, event) {
    try {
        if (message.length > 0) {
            let prefix = message.split("")[0];
            if (prefix == "+") {
                let parts = message.substring(1).split(" ");
                let command = parts[0];
                let args = [];
                if (parts.length > 1) {
                    parts.shift();
                    args = parts;
                }
                console.log("user", user, "command", command, "args", args);
                if (command == "ping") {
                    bot.sendMessage({
                        to: channelID,
                        message: "pong"
                    });
                }
                else if (!hasServiceBot()) {
                    console.log("no service");
                    let msg = `Hi **${user}** ! Noticed you are trying to issue a bot command.\n` +
                        `:exclamation: No bot is online currently to service your command.\n` +
                        `Activating main bots ( <${BOT_SERVER_MAIN_URL}> ) .\n`;
                    bot.sendMessage({
                        to: channelID,
                        message: msg
                    });
                    console.log("activating", BOT_SERVER_MAIN_URL);
                    http.get(BOT_SERVER_MAIN_URL, (res) => {
                        let statusCode = res.statusCode;
                        console.log("main bot activation result", statusCode);
                        if (statusCode == "200") {
                            msg = `:thumbsup: Main bots are up. **You can issue commands now.**`;
                            bot.sendMessage({
                                to: channelID,
                                message: msg
                            });
                            setTimeout(function () {
                                bot.sendMessage({
                                    to: channelID,
                                    message: message
                                });
                            }, 3000);
                        }
                        else {
                            msg = `:triangular_flag_on_post: There was a problem activating main bot.\n` +
                                `Falling back to reserve bot ( <${BOT_SERVER_RESERVE_URL}> ) .`;
                            bot.sendMessage({
                                to: channelID,
                                message: msg
                            });
                            http.get(BOT_SERVER_RESERVE_URL, (res) => {
                                let statusCode = res.statusCode;
                                console.log("reserve bot activation result", statusCode);
                                if (statusCode == "200") {
                                    msg = `:thumbsup: Reserve bot is up. **You can issue commands now.**`;
                                    bot.sendMessage({
                                        to: channelID,
                                        message: msg
                                    });
                                    setTimeout(function () {
                                        bot.sendMessage({
                                            to: channelID,
                                            message: message
                                        });
                                    }, 3000);
                                }
                                else {
                                    msg = `:triangular_flag_on_post: There was a problem activating reserve bot.\n` +
                                        `Please contact the system admin.`;
                                    bot.sendMessage({
                                        to: channelID,
                                        message: msg
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});
// server startup
const app = express();
app.use(morgan('combined'));
app.use(express.static('server/assets'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pages/index.html')));
app.listen(PORT, () => console.log(`lichessapps server listening on ${PORT}`));
