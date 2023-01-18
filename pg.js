//import fetch from "node-fetch";
//import jsdom from "jsdom";
//import { chatIds, adminId, token, bot } from "./modules/telegram_m/telegram.js";
import { pool, execute }                from "./modules/postgres_m/postgres.js";

const param = "SELECT * FROM status ORDER BY date DESC"
execute(param)
.then((result) => {
  if (result) {
    const mes = result.rowCount ? result.rows[0].status : "";
    
    console.log(mes);
    //bot.sendMessage(adminId, `${adminId}  ${mes}`);

    //chatIds.split(",").forEach((el) => console.log(`Hi ${el}! ${mes}`));
  } else {
    console.log("err " + result);
  }
})
.finally(() => {
    console.log('Experiment completed!');
    process.exit() 
  });
  
//bot.sendMessage(adminId, "test")

console.log('Experiment started...')
