     
     const dateTimeToLocale = (date) => {
        const options = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        };
        //return date.format("DD.MM.YYYY HH:mm:ss")
        return date.toLocaleDateString("ru-RU", options);
        }
        
        export {dateTimeToLocale}