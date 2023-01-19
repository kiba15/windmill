# windmill
Telegram Bot for controlling Windmill:

- It gets notification when status of Windmill changes.
- User can get status and other parameters by clicking a bot button


INSTALL

1. Clone repository (git clone)
2. npm install (install dependencies)
3. Install Postgresql
4. Fill .env file

.ENV structure

DB_CONLIMIT=50
DB_HOST=localhost
DB_USER='postgres'
DB_PASSWORD='XXXXXXXXXX'
DB_DATABASE='windmill'
DB_PORT=5432
URL_STATUS1 ="http://windscada.com:17574/readreg.htm;reg-R1103;fmt-UINT;rfs-14"
URL_STATUS2 ="http://windscada.com:17574/readreg.htm;reg-R1104;fmt-UINT;rfs-14"
URL_WIND    ="http://windscada.com:17574/readreg.htm;reg-R1068;fmt-REAL;rfs-15"
URL_POWER   ="http://windscada.com:17574/readreg.htm;reg-R1075;fmt-UINT;rfs-14"
TG_TOKEN='XXXXXXXXXX'
TG_USERS='XXXXXXXXXX'
TG_ADMIN='XXXXXXXXXX'

