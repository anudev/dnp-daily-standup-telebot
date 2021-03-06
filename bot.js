const Telegraf = require('telegraf');
const config = require('./config');
const dataService = require('./dataService');

const bot = new Telegraf(config.botToken);

const helpMsg = `Command reference:
/start - Start bot (mandatory in groups)
/startStandUp - Print random list of users
/about - Show information about the bot
/help - Show this help page`;

const aboutMsg = "This bot was created by @AnuDev\nSource code and contact information can be found at https://github.com/anudev/dnp-daily-standup-telebot";

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

function userString(ctx) {
    return JSON.stringify(ctx.from.id === ctx.chat.id ? ctx.from : {
        from: ctx.from,
        chat: ctx.chat
    });
}

function logMsg(ctx) {
    var from = userString(ctx);
    console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
    console.log('>', {
        id: ctx.chat.id
    }, text);
}

const users = new Map();

function getChatName(ctx) {
    return ctx.chat.title;
}

bot.hears(message => !/\/(start|startStandUp|help|about)/.test(message),
    ctx => {
        const chatName = getChatName(ctx);
        if (!users.has(chatName)) {
            users.set(chatName, new Set());
        }
        users.get(chatName).add(`@${ctx.message.from.username}`);
    });

bot.command('startStandUp', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, aboutMsg);
    const userForSort = [];
    const chatName = getChatName(ctx);
    for (let user of users.get(chatName).keys()) {
        userForSort.push({sortKey: Math.floor(Math.random() * 10000), user: user})
    }
    userForSort.sort((a, b) => a.sortKey - b.sortKey);
    const msg = userForSort.map((val, index) => `${index + 1} ${val.user}`).join('\n');
    if (msg) {
        ctx.reply(msg);
    }
});

bot.start(ctx => {
    logMsg(ctx);
    dataService.registerUser(ctx);
    dataService.setCounter(ctx.chat.id, '0', 0);
    var m = "Hello, I'm daily standUp support bot.";
    ctx.reply(m);
    logOutMsg(ctx, m);
});

bot.help(ctx => {
    logMsg(ctx);
    logOutMsg(ctx, helpMsg);
    ctx.reply(helpMsg);
});

bot.command('about', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, aboutMsg);
    ctx.reply(aboutMsg);
});


bot.startPolling();

module.exports = {}