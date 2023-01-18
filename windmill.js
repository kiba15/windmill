import { chatIds, adminId, token, bot }  from "./modules/telegram_m/telegram.js";
import { pool, execute, addStatus, lastStatus }   from "./modules/postgres_m/postgres.js";
import { valueFromPage }                 from "./modules/parsing_m/parse.js";
import { dateTimeToLocale }              from "./modules/common_m/common.js";
import dotenv from "dotenv"
dotenv.config()

const intervalSeconds  = 5;
const hoursInactive    = 1

let lastDate      = new Date();

const myFunc = () => {

  // Обернули в асинхронную функцию
  (async () => {
    try {
      // STATUS 1

      let message
      const status1 = await valueFromPage(process.env.URL_STATUS1, "body");
      const status2 = await valueFromPage(process.env.URL_STATUS2, "body");

      // ЕСЛИ ОШИБКА ПРОВЕРИМ ВРЕМЯ
      if (status1 === undefined || status2 === undefined) {
        console.log('error getting info...')
        if ((new Date() - lastDate) / (1000 * 3600) >= hoursInactive) {
        
        message = `Ошибка получения данных! Сервер не отвечает больше 0.5 часа с ${dateTimeToLocale(lastDate)}, проверьте все ли с ним в порядке!` 
        chatIds.forEach((chatId) => {
        try {
            bot.sendMessage(chatId, message)
            }  catch (err) {
            console.log(err.message)}
        });
        }
        return;
      }
      
      const currentValue = `${status1}:${status2}`;
      lastDate = new Date();
      
      // считаем из bd последний статус
      const lastResultRecord = await lastStatus()
      const prevValue = (lastResultRecord === undefined ? undefined : lastResultRecord.status)

      if (prevValue !== currentValue) {
      
        // Запишем в bd новый статус
        const newRecord = {"status": currentValue, "comment": 'status changed'}
        await addStatus(newRecord)

        message = `Значение поля Status изменилось с ${prevValue} на ${currentValue}`;        
        console.log(message);
        chatIds.forEach((chatId) => {
        try {
            bot.sendMessage(chatId, message)
            }  catch (err) {
            console.log(err.message)}
        });

      }
      
    } catch (err) {
      console.log("Error - " + err.message);
      bot.sendMessage(adminId, err.message)
    }
  })();
};

console.log(process.env.TG_USERS.split(','))

setInterval(myFunc, intervalSeconds * 1000);
