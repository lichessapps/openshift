"use strict";

// system
const express = require('express')
const http = require('http')
const morgan = require('morgan')
const path = require('path')
const fetch_ = require('node-fetch')
const FormData_ = require('form-data')
const fs=require("fs")
const schedule = require('node-schedule')

const PORT = 8080

function isProd(){
    return ( process.env.DISCORD_LOCAL == undefined );
}

function isDev(){
    return !isProd();
}

console.log(`application started in ${isProd()?"production":"development"} mode`)