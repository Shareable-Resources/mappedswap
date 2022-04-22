============================
instruction for Server side
============================
1 --------------- pull docker image and start docker ---------------

docker pull mysql
docker run -d --name mysql -p 3406:3306 -e MYSQL_ROOT_PASSWORD=mypassword -e MYSQL_DATABASE=telegram-support mysql

2 --------------- create telegram bot ---------------

Creating a telegram bot
https://core.telegram.org/bots

https://api.telegram.org/bot5145554072:AAHysr-HIqfISvx1QSmHYER05IfwTQ7A9A0/getMe


3 --------------- start api server ---------------

cd /server

create .env file and set telegram token and random key for JWT
    TOKEN=<token>   // 5145554072:AAHysr-HIqfISvx1QSmHYER05IfwTQ7A9A0
    key=<key>       // encrytion key - any string value

npm install
npm start

============================
instruction for Client side
============================