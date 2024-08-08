const Discord = require('discord.js');
const chalk = require('chalk'); 
const config = require('../config');

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,
    async execute(client) {

        console.log(chalk.red(`
███████╗██╗  ██╗   ██╗██████╗ ███████╗██╗   ██╗
██╔════╝██║  ╚██╗ ██╔╝██╔══██╗██╔════╝██║   ██║
█████╗  ██║   ╚████╔╝ ██║  ██║█████╗  ██║   ██║
██╔══╝  ██║    ╚██╔╝  ██║  ██║██╔══╝  ╚██╗ ██╔╝
██║     ███████╗██║   ██████╔╝███████╗ ╚████╔╝ 
╚═╝     ╚══════╝╚═╝   ╚═════╝ ╚══════╝  ╚═══╝ 
        `));
        console.log(chalk.green(`Logged in as ${client.user.tag}!`));
        console.log(chalk.green(`Kaç Komut Yüklendi: ${client.commands.size}`));
        console.log(chalk.green(`Toplam Üye Sayısı: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`));

        const rainbowColors = [
            '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
            '#0000ff', '#4b0082', '#9400d3', '#00ff00'
        ];

        let colorIndex = 0;
        let statusIndex = 0;


        setInterval(() => {

            const activity = {
                name: `Komutlar: ${client.commands.size}`,
                type: Discord.ActivityType.Listening
            };

            colorIndex = (colorIndex + 1) % rainbowColors.length;
            client.user.setPresence({
                activities: [activity],
                status: 'dnd',
            });


            if (statusIndex % 2 === 0) {
                client.user.setActivity({ name: 'Sleep Mode', type: Discord.ActivityType.Custom });
            } else {
                client.user.setActivity({ name: `Komutlar: ${client.commands.size}`, type: Discord.ActivityType.Listening });
            }

            statusIndex++;
        }, 10000);

        client.user.setActivity({
            name: `Komutlar: ${client.commands.size}`,
            type: Discord.ActivityType.Watching
        });
    },
};
