const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();
const webhookListener = require('./scripts/webhook_listener');

const commands = require('./scripts/commandsReader')(process.env.PREFIX);
const cron = require('cron');

const unknowCommand = require('./scripts/unknowCommand');
const dailyReset = require('./scripts/dailyReset');
const updateRank = require('./scripts/updateRank');

// reset handle of all users [second, minute, hour, day, month, day_of_week] eg. 0AM = '00 00 00 * * *'
// every 1 hour
const timeDailyReset = new cron.CronJob('* * */1 * *', () => {
    console.log('Loading daily reset...');

    const guild = client.guilds.cache.get(process.env.SERVER_ID);
    dailyReset(guild);
});

timeDailyReset.start();

client.on('ready', () => {
    console.log('BOT is online!');
});

client.on('message', msg => {

    if (!msg.author.bot && msg.guild) {
        const args = msg.content.split(' ');
        
        if (commands[args[0]]) commands[args[0]](client, msg);
        else if(Number.isInteger(parseInt(args[0]))) return;
        else if(args[0].split('')[0] == process.env.PREFIX) unknowCommand(client, msg);
    }

});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    updateRank(newMember.guild, newMember);
});

client.on('guildMemberAdd', member => {
    updateRank(member.guild, member);
});

client.login(process.env.DISCORD_TOKEN);