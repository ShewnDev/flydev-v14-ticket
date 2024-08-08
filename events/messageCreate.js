const Discord = require('discord.js');
const config = require('../config.js'); 

module.exports = {
    name: Discord.Events.MessageCreate,
    execute(message) {

        if (!message.content.startsWith(config.prefix) || message.author.bot) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();


        if (message.client.commands.has(command)) {
            try {
                message.client.commands.get(command).execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('Komutu çalıştırırken bir hata oluştu!');
            }
        }
    },
};
