import TelegramBot from "node-telegram-bot-api";
import {
  lastStatus,
  addUserAction,
} from "../../modules/postgres_m/postgres.js";
import { valueFromPage }    from "../../modules/parsing_m/parse.js";
import { dateTimeToLocale } from "../../modules/common_m/common.js";
import fetch  from "node-fetch";
import jsdom  from "jsdom";
import dotenv from "dotenv";
dotenv.config();

const { JSDOM } = jsdom;

const token = process.env.TG_TOKEN;
const chatIds  = process.env.TG_USERS.split(",");
const adminIds = process.env.TG_ADMIN.split(",");
const bot = new TelegramBot(token, { polling: true });

// ОБРАБОТКА СТАРТА БОТА
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id.toString();

  // Запишем в bd действие
  //(async () => {
  //await addUserAction({"userId": chatId, "userName": msg.chat.first_name, "action": 'start bot'})
  //})()

  if (!chatIds.includes(chatId)) {
    bot.sendMessage(chatId, `Access denied for ${chatId}`);
    console.log(chatId);
    console.log(chatIds);
    return;
  }

  let ButtonMas = [["Статус Wind/Power"]];

  if (adminIds.includes(chatId)) {
    ButtonMas.push(["Статистика"]);
  }

  // ВЫВОДИМ КНОПКИ ВНИЗУ
  bot.sendMessage(chatId, "Welcome", {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: false,
      keyboard: ButtonMas,
    },
  });

  return;

  //  БАЛУЕМСЯ С КНОПКАМИ INLINE
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "YES",
            callback_data: JSON.stringify({
              command: "mycommand1",
              answer: "YES",
            }),
          },
          {
            text: "NO",
            callback_data: JSON.stringify({
              command: "mycommand1",
              answer: "NO",
            }),
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, "Main menu", inlineKeyboard);
});

// ОБРАБОТКА POLLING ОШИБОК
bot.on("polling_error", console.log);

// ОБРАБОТКА CALLBACK
bot.on("callback_query", (msg) => console.log(msg));

bot.on("message", (msg) => {
  const chatId = msg.chat.id.toString();

  if (!chatIds.includes(chatId)) {
    bot.sendMessage(chatId, `Access denied for ${chatId}`);
    return;
  }

  if (msg.text === "Статус Wind/Power") {
    bot.sendMessage(chatId, `Получение данных с сервера ...`);

    // Обернули в асинхронную функцию
    (async () => {
      try {
        // Запишем в bd действие
        await addUserAction({
          userId: chatId,
          userName: msg.chat.first_name,
          action: msg.text,
        });

        // STATUSES
        const status1 = await valueFromPage(process.env.URL_STATUS1, "body");
        const status2 = await valueFromPage(process.env.URL_STATUS2, "body");
        // WIND
        const wind = await valueFromPage(process.env.URL_WIND, "body");
        // POWER
        const power = await valueFromPage(process.env.URL_POWER, "body");

        bot.sendMessage(
          chatId,
          `Status ${status1}:${status2}, Wind ${wind} m/s, Power ${power} kW`
        );
      } catch (err) {
        bot.sendMessage(chatId, `Ошибка получения данных! ${err.message}`);
      }
    })();
  } else if (msg.text === "Статистика") {
    bot.sendMessage(chatId, `Получение данных из базы данных ...`);

    // Обернули в асинхронную функцию
    (async () => {
      try {
        // Запишем в bd действие
        await addUserAction({
          userId: chatId,
          userName: msg.chat.first_name,
          action: msg.text,
        });

        const result = await lastStatus();
        bot.sendMessage(
          chatId,
          result === undefined
            ? `Последний статус еще не записан...`
            : `Последний статус ${result.status} - ${dateTimeToLocale(
                result.date
              )}`
        );
      } catch (err) {
        bot.sendMessage(chatId, `Ошибка получения данных! ${err.message}`);
      }
    })();
  } else {
    //chatIds.forEach((chatId) => bot.sendMessage(chatId, msg.text));

    // Запишем в bd действие
    (async () => {
      await addUserAction({
        userId: chatId,
        userName: msg.chat.first_name,
        action: msg.text,
      });
    })();

    bot.sendMessage(
      chatId,
      `Получили ваше сообщение! ${msg.text} ${msg.message_id} ${msg.chat.first_name} ${chatId}`
    );
  }
});

export { chatIds, adminIds, token, bot };
