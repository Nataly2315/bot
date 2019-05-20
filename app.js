const TelegramBot = require('node-telegram-bot-api');
const request= require ('request');

const token = '736680208:AAFBgN3plB2Kilgk6OYgrtbYJFfB3FLUZ2U';


const bot = new TelegramBot(token, {polling: true});

const flag = {
    'EUR': '🇪🇺',
    'USD': '🇺🇸',
    'RUR': '🇷🇺',
    'UAH': '🇺🇦'
};



bot.onText(/\/currencies/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Какая валюта вас интересует?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text:"€ EUR",
                        callback_data: 'EUR',
                    },

                    {
                        text:"$ USD",
                        callback_data: 'USD',
                    },

                    {
                        text:"₽ RUB",
                        callback_data: 'RUR',
                    },

                ]

            ]
        }
    });
});

bot.on('callback_query', query=> {
    const id = query.message.chat.id;
    if (query.message.text == "Какая валюта вас интересует?") {
        request('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5', function (error, response, body) {
            const data = JSON.parse(body);
            const result = data.filter(item => item.ccy === query.data)[0];

            let md = `* ${flag[result.ccy]} ${result.ccy} ➡ ${result.base_ccy}  ${flag[result.base_ccy]}* \nBuy: _${Math.trunc(result.buy * 100) / 100}_ \nSale: _${Math.trunc(result.sale * 100) / 100}_`;
            bot.sendMessage(id, md, {parse_mode: 'Markdown'});

        })
    }

    else if (query.message.text == 'Выберите валюту для конвертации') {

            request('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5', function (error, response, body) {

                const cur= query.data.slice(0 ,3 );
                var summ = +query.data.slice(3);
                const data = JSON.parse(body);
                const result = data.filter(item => item.ccy === cur)[0];
                let res = (summ / result.sale);
                let md = ` ${flag['UAH']} ${result.base_ccy} ➡ ${result.ccy}  ${flag[result.ccy]} \n*${summ}*  ${result.base_ccy} = *${Math.trunc(res * 100) / 100}* ${result.ccy}`;
                bot.sendMessage(id, md, {parse_mode: 'Markdown'});

            })
    }
});


bot.onText(/\/converter/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,  'Введите сумму в гривнах которую необходимо конвертировать');



});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Добрый день! Введите:\n\/currencies - что бы узнать курс валют\n\/converter - что бы конвертировать валюты');

});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    var summ = msg.text;


    if (summ.match(/,/i)!= -1){summ = summ.replace(",",".");
    console.log(summ)};
    if ((summ!='/converter') && (summ!='/start') && (summ!='/currencies')){

    summ = Number(summ);
     if (isNaN(summ)){
        bot.sendMessage(chatId,`Такой команды нет 😨 \n*Попробуйте ввести:*\n\/currencies - что бы узнать курс валют\n\/converter - что бы конвертировать валюты`, {parse_mode: 'Markdown'});
    }

    else {
        bot.sendMessage(chatId,`Вы ввели *${summ}* грн`, {parse_mode: 'Markdown'});
        bot.sendMessage(chatId,  'Выберите валюту для конвертации',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "€ EUR",
                                callback_data: 'EUR'+summ,

                            },

                            {
                                text: "$ USD",
                                callback_data: 'USD'+summ,

                            },

                            {
                                text: "₽ RUB",
                                callback_data: 'RUR'+summ,

                            },

                        ]

                    ]
                }
            });

    }
}});
