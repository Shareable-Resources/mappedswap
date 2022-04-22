const botService = require('../services/bot');

let lang = 'eng';
let menu = require('./telegramMenu');

function init() {
    const TelegramBot = require('node-telegram-bot-api');

    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TOKEN;

    // Create a bot that uses 'polling' to fetch new updates
    global.bot = new TelegramBot(token, {polling: true});

    // Listen for any kind of message. There are different kinds of
    // messages.
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        if (msg.text === '/start') {
            bot.sendMessage(chatId, menu.start.text, menu.start.options);
        }
        else {
            // todo
            // call bot service to createMessage
            
            const result = await botService.createMessage(msg)
            if (result.ticketId) {
                bot.sendMessage(chatId, "new Ticket ID>" + result.ticketId)
            }
            //console.log(await bot.sendMessage(chatId, 'Received your message'));
        }
    });

    bot.on('callback_query', async (msg) => {
        let chat_id = msg.message.chat.id;
        let message_id = msg.message.message_id;

        // English version
        if (msg.data === "eng") {
            lang = "eng"
            menu = require('./telegramMenu')
            const options = {...menu.mainMenu.options, chat_id, message_id}
            bot.editMessageText(menu.mainMenu.text, options)
        }
        else if (msg.data === "chn") {
            lang = "chn"
            menu = require('./telegramMenu_chn')
            const options = {...menu.mainMenu.options, chat_id, message_id}
            bot.editMessageText(menu.mainMenu.text, options)
        }
        else if (msg.data === "live_support") {
            // get taipei time
            const date = new Date()
            const locale = 'en-US'
            const timeZone = 'Asia/Taipei'
            // time in Taipei
            const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }).format(date);
            const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone }).format(date);

            if(weekday === 'Saturday' || weekday === 'Sunday' || parseInt(time.substring(0,2)) < 10 || parseInt(time.substring(0,2)) > 18) {
                const options = {...menu.live_support_off.options, chat_id, message_id}
                bot.editMessageText(menu.live_support_off.text, options)
            }
            else {
                const options = {...menu.live_support.options, chat_id, message_id}
                bot.editMessageText(menu.live_support.text, options)
            }
        }
        else {
            const options = {...menu[msg.data].options, chat_id, message_id}
            bot.editMessageText(menu[msg.data].text, options)
        }
    })

    return bot;
}

module.exports = {
    start: init
};