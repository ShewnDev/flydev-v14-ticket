const Discord = require('discord.js');
const config = require('../config.js'); 
const emojis = require('../emojis.js');

module.exports = {
    name: 'system',
    description: 'Toggle the ticket system active or inactive.',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const isActive = config.ticketSystemActive || false;


        const toggleButton = new Discord.ButtonBuilder()
            .setCustomId('toggleTicketSystem')
            .setLabel(isActive ? `Ticket Sistemi Kapalı ${interaction.guild.emojiGöster(emojis.off)}` : `Ticket Sistemi Aktif ${interaction.guild.emojiGöster(emojis.on)}`)
            .setStyle(Discord.ButtonStyle.Primary);

        const row = new Discord.ActionRowBuilder()
        .addComponents(toggleButton);


        const embed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ticket Sistemi Durumu')
            .setDescription(`Ticket sistemi şu anda ${isActive ? interaction.guild.emojiGöster(emojis.on) : interaction.guild.emojiGöster(emojis.off)}`)
            .setFooter({ text: 'Butona tıklayarak durumu değiştirebilirsiniz.' });


        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
