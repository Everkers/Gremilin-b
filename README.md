# Gremilin-b
Gremilin is a discord bot for league of legends player that provides you with some useful information about your account and some other features
## Why Gremilin
We built Gremilin to make sure the players got the information that they need quickly while they hanging out with friends on the discord server without waste time visiting websites like <a href='https://www.op.gg/'>Op.gg</a> etc
## Commands
- ``?help`` - This command will show you all the available commands
- ``?setUser [username] [region]`` - This command will add your username and region to the database.
- ``?updateUser [new username] [new region]`` - This command will update your username and region if they already exist.
- ``?profile`` - This command will show you your profile on league of legends including last match etc.
- ``?champion [champion]`` - This command will give you all the information you need to know about a champion.
- ``?editme`` - This command will put your profile picture on a league of legends border.
## Invite Gremilin to your server :heart:
The easiest way to set this bot up on your server is to <a href='https://discordapp.com/oauth2/authorize?client_id=628226371495133204&scope=bot&permissions=1074021376'>invite it </a> to your Discord server. It is currently hosted 24/7 and will always get the newest features first.

In order to do that, just <a href='https://discordapp.com/oauth2/authorize?client_id=628226371495133204&scope=bot&permissions=1074021376'>click here </a>and choose a server. You need to have Manage Server permission on that server. You may remove some of the permissions if you wish, but be warned it may break current and upcoming features.
## Tech used 
- Node js
## APIs used
- we used <a href='https://developer.riotgames.com/'>Riot Api</a> to be able to fetch users data.
- we used <a href='https://github.com/Everkers/leagueFire'>League Fire API</a> to get the extra information that Riot API not provide.
## Local Instalation
to install gremilin in your machine follow these steps:
- Install <a href=''>Node.js v12.14.0</a>
- Download Gremilin ``git clone https://github.com/Everkers/Gremilin-b.git``  or if you don't have/want to use git, download the ZIP by clicking the green Download button at the top right of this page)
- cd to to Gremilin directory and run ``npm install`` in your commands line to install all the required dependencies
- Create ``.env`` file and add **TOKEN_LOL = YOUR TOKEN HERE** and **TOKEN_BOT = YOUR BOT TOKEN HERE**
- Run the bot with ``npm run dev``
