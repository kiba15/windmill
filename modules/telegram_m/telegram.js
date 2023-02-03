import TelegramBot from "node-telegram-bot-api";
import {
  lastStatus,
  getLastActions,
  addUserAction,
} from "../../modules/postgres_m/postgres.js";
import { valueFromPage }    from "../../modules/parsing_m/parse.js";
import { dateTimeToLocale } from "../../modules/common_m/common.js";
import fetch  from "node-fetch";
import jsdom  from "jsdom";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
dotenv.config();

const { JSDOM } = jsdom;

const token = process.env.TG_TOKEN;
const chatIds  = process.env.TG_USERS.split(",");
const adminIds = process.env.TG_ADMIN.split(",");
const bot = new TelegramBot(token, { polling: true });

// это чтобы telegrem не ругался при отправке фото
process.env["NTBA_FIX_350"] = 1;

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
  
  if (msg.photo) {
       
       const fileId = msg.photo[msg.photo.length - 1].file_id;
       
       if (!fs.existsSync('./images')){fs.mkdirSync('./images')}
       
       bot.getFileLink(fileId)
         .then(link=> 
             axios({method: "get", url: link, responseType: "stream"})
             .then(response =>
             response.data.pipe(fs.createWriteStream("./images/"+fileId))
          )); 
 
        // Запишем в bd действие
        (async () => {
         await addUserAction({
            userId: chatId,  
            messageId: msg.message_id,
            messageType: 'image',            
            userName: msg.chat.first_name,
            fileId: fileId,                
            text: '',
          });
        })();
        bot.sendMessage(
          chatId,
          `Получили ваше изображение! ${fileId} ${msg.message_id} ${msg.chat.first_name} ${chatId}`
         );       
        return;              
 
  }
  if (msg.document) {
  
       const fileId   = msg.document.file_id;
       const fileName = msg.document.file_name
       const fullDirName = './documents/' + fileId;
      
       if (!fs.existsSync('./documents')){fs.mkdirSync('./documents')}
       if (!fs.existsSync(fullDirName)){fs.mkdirSync(fullDirName)}       
       
       bot.getFileLink(fileId)
         .then(link=> 
             axios({method: "get", url: link, responseType: "stream"})
             .then(response =>
             response.data.pipe(fs.createWriteStream(fullDirName + '/' + fileName))
          )); 

      // Запишем в bd действие
      (async () => {
       await addUserAction({
            userId: chatId,  
            messageId: msg.message_id,
            messageType: 'document',            
            userName: msg.chat.first_name,
            fileId: fileId,            
            text: fileName,
        });
      })();
      bot.sendMessage(
        chatId,
        `Получили ваш документ! ${fileName} ${msg.message_id} ${msg.chat.first_name} ${chatId}`
       );       
      return;        
              
  }

  if (msg.text === "Статус Wind/Power") {
    // Статус Wind/Power ************************ Статус Wind/Power   
    bot.sendMessage(chatId, `Получение данных с сервера ...`);

    // Обернули в асинхронную функцию
    (async () => {
      try {
        // Запишем в bd действие
        await addUserAction({
          userId: chatId,  
          messageId: msg.message_id,
          messageType: 'command',          
          userName: msg.chat.first_name,
          fileId: undefined,            
          text: msg.text,
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
    // СТАТИСТИКА ************************ СТАТИСТИКА
    bot.sendMessage(chatId, `Получение данных из базы данных ...`);

    // Обернули в асинхронную функцию
    (async () => {
      try {
        // Запишем в bd действие
        await addUserAction({
          userId: chatId,  
          messageId: msg.message_id,
          messageType: 'command',          
          userName: msg.chat.first_name,
          fileId: undefined, 
          text: msg.text,
        });

        const resultStatus  = await lastStatus();
        const lastActions   = await getLastActions();

        bot.sendMessage(
          chatId,
          resultStatus === undefined
            ? `Последний статус еще не записан...`
            : `Последний статус ${resultStatus.status} - ${dateTimeToLocale(
              resultStatus.date
              )}`
        );
        
//         if (lastActions.length) {
//            bot.sendMessage(chatId, lastActions.reduce((mes, el) => mes = mes + `${dateTimeToLocale(el.date)} ${el.username}\n${el.messagetype + ': ' + el.text}\n-----\n`, '' ));
//        }

        for (const el of lastActions) {
           await bot.sendMessage(chatId, `${dateTimeToLocale(el.date)} ${el.username}\n${el.messagetype + ': ' + el.text}\n-----\n`);
           el.messagetype === 'image' 
           ? await bot.sendPhoto(chatId, './images/' + el.fileid)
           : el.messagetype === 'document' 
           ?  await bot.sendDocument(chatId, el.fileid)      
           : ''
        }   

        //await lastActions.forEach((el) => {
        //  bot.sendMessage(chatId, `${dateTimeToLocale(el.date)} ${el.username}\n${el.messagetype + ': ' + el.text}\n-----\n`);
        //  el.messagetype === 'image' 
        //  ? bot.sendPhoto(chatId, './images/' + el.fileid)
        //  : ''
        // } )
        
        // bot.sendPhoto(chatId, './images/AgACAgIAAxkBAAEBcA9jzYiccnnxFA8XEkYQj9pWz3y_uQAC28MxG1zdaEoMJtmt33MHYAEAAwIAA3kAAy0E')
        //.then(data => console.log(data));

      } catch (err) {
        bot.sendMessage(chatId, `Ошибка получения данных! ${err.message}`);
      }
    })();
  } else {

    // Запишем в bd действие
    (async () => {
      await addUserAction({
        userId: chatId,  
        messageId: msg.message_id,
        messageType: 'text',         
        userName: msg.chat.first_name,
        fileId: undefined,         
        text: msg.text,
      });
    })();

    bot.sendMessage(
      chatId,
      `Получили ваше сообщение! ${msg.text} ${msg.message_id} ${msg.chat.first_name} ${chatId}`
    );
  }
});

export { chatIds, adminIds, token, bot };