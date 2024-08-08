const Discord = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Create a support ticket.',
    async execute(message, args) {

        const embed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ticket Support System')
            .setDescription(`
Merhaba ${message.member}, Ticket yönetimine Hoşgeldin,

\` • \` *Aşağıda bulunan butona tıklayarak yeni bir destek talebi oluşturabilirsin.*           
\` • \` *Ticket aç butonuna basarak Ticket açabilirsin iyi günler*`);

        const button = new Discord.ButtonBuilder()
            .setCustomId('createTicket')
            .setLabel('🎫 Ticket Aç')
            .setStyle(Discord.ButtonStyle.Primary);


        const row = new Discord.ActionRowBuilder()
        .addComponents(button);

        await message.reply({ embeds: [embed], components: [row] });
    },
};
