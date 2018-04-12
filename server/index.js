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
function createTourney(lila2, name, waitMinutes, time, inc, callback) {
    console.log(`creating atomic tourney ${time}+${inc} wait ${waitMinutes}`);
    let form = new FormData_();
    form.append("system", "1");
    //form.append("isprivate","");
    form.append("password", "");
    form.append("name", `${name}`);
    form.append("variant", "7");
    form.append("position", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    form.append("mode", "1");
    form.append("waitMinutes", `${waitMinutes}`);
    form.append("clockTime", `${time}`);
    form.append("clockIncrement", `${inc}`);
    form.append("minutes", "120");
    form.append("conditions.nbRatedGame.nb", 100);
    form.append("conditions.nbRatedGame.perf", "atomic");
    form.append("conditions.maxRating.rating", "9999");
    form.append("conditions.maxRating.perf", "atomic");
    form.append("conditions.minRating.rating", "1800");
    form.append("conditions.minRating.perf", "atomic");
    form.append("conditions.titled", "false");
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
let TOURNEY_SCHEDULE = {};
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
                /*createTourney(lila2,time,inc,(content:any)=>{
                    //console.log(content)
                })*/
            });
        });
    }
}
if (isProd())
    scheduleTourneys();
// server startup
const app = express();
app.use(morgan('combined'));
app.use(express.static('server/assets'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pages/index.html')));
//app.listen(PORT, () => console.log(`lichessapps server listening on ${PORT}`))
login(LICHESS_USER, LICHESS_PASS, (lila2) => {
    console.log(`login ok`);
    createTourney(lila2, process.argv[2], process.argv[3], process.argv[4], process.argv[5], (content) => {
        console.log("tourney creation returned");
        //console.log(content)
    });
});
