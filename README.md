# windmill
Telegram Bot for controlling Windmill:

- It gets notification when status of Windmill changes.
- User can get status and other parameters by clicking a bot button


INSTALL

1. Git clone
2. npm install
3. install postgresql
4. fill .env file

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
TG_TOKEN='XXXXX'
TG_USERS='XXXXX'
TG_ADMIN='XXXXX'

