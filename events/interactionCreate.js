const Discord = require('discord.js'); //! Bütün gereken herşeyi burdan çektirdim ayrı ayrı çok kalabalık duruyordu keyfinize göre ayarlarsınız
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const config = require('../config.js');

module.exports = {
    name: Discord.Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'createTicket') {

            //? TICKET ADINDA KATEGORİ AÇIN ONDAN SONRA KULLANMAYI DENEYİN YOKSA YAPMAZ MANTIKEN KANKA

            const category = interaction.guild.channels.cache.find(channel => channel.name === 'TICKET' && channel.type === Discord.ChannelType.GuildCategory);
            
            if (!category) {
                return interaction.reply({ content: 'Bilet kanalları için "TICKET" adlı kategori bulunamadı.', ephemeral: true });
            }

            const existingTicket = interaction.guild.channels.cache.find(channel => channel.name === `ticket-${interaction.user.username}` && channel.type === Discord.ChannelType.GuildText);

            if (existingTicket) {
                const embed = new Discord.EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Mevcut Ticket Bulundu')
                    .setDescription('Zaten bir destek talebiniz bulunuyor. Ticketınızı silmek ister misiniz?');

                const deleteButton = new Discord.ButtonBuilder()
                    .setCustomId('deleteExistingTicket')
                    .setLabel('Ticketımı Sil')
                    .setStyle(Discord.ButtonStyle.Danger);

                const row = new Discord.ActionRowBuilder().addComponents(deleteButton);

                return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }

            const guild = interaction.guild;
            const member = interaction.member;
            const currentDate = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

            const ticketChannel = await guild.channels.create({
                name: `ticket-${member.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: category.id, // Kategoriye yerleştir
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                    },
                ],
            });

            const deleteButton = new Discord.ButtonBuilder()
                .setCustomId('deleteTicket')
                .setLabel('Delete Ticket')
                .setStyle(Discord.ButtonStyle.Danger);

            const actionRow = new Discord.ActionRowBuilder().addComponents(deleteButton);

            const ticketEmbed = new Discord.EmbedBuilder()
                .setColor('#00ff99')
                .setTitle('Destek Talebi Açıldı')
                .setDescription(`Merhaba ${member.user.tag},\n\nBu kanal senin destek talebin için oluşturuldu. Burada destek ekibimiz ile iletişime geçebilirsin.`)
                .addFields(
                    { name: 'Ticket Açılma Tarihi', value: currentDate, inline: true },
                    { name: 'Kullanıcı', value: member.user.tag, inline: true }
                )
                .setFooter({ text: 'Destek Ekibi En Kısa Sürede Size Ulaşacaktır.' })
                .setTimestamp();

            await ticketChannel.send({ embeds: [ticketEmbed], components: [actionRow] });

            await interaction.reply({ content: `🎫 Ticket kanalın ${ticketChannel} oluşturuldu!`, ephemeral: true });

            const notificationChannel = guild.channels.cache.find(channel => channel.name === config.deleteticketLog);
            if (notificationChannel) {
                const notifyEmbed = new Discord.EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Yeni Ticket Açıldı')
                    .setDescription(`${member.user.tag} tarafından yeni bir ticket açıldı: ${ticketChannel}`)
                    .addFields(
                        { name: 'Ticket Açılma Tarihi', value: currentDate, inline: true },
                        { name: 'Kullanıcı', value: member.user.tag, inline: true }
                    )
                    .setTimestamp();

                await notificationChannel.send({ embeds: [notifyEmbed] });
            }
        }

        if (interaction.customId === 'deleteExistingTicket') {
            const existingTicket = interaction.guild.channels.cache.find(channel => channel.name === `ticket-${interaction.user.username}` && channel.type === Discord.ChannelType.GuildText);
            
            if (!existingTicket) {
                return interaction.reply({ content: 'Mevcut ticket kanalınız bulunamadı.', ephemeral: true });
            }

            const messages = await existingTicket.messages.fetch({ limit: 100 });
            const messageArray = messages.map(msg => ({
                author: msg.author.tag,
                authorId: msg.author.id,
                avatar: msg.author.avatar ? msg.author.avatar : 'default_avatar', // Fallback avatar
                content: msg.content,
                createdAt: msg.createdAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
            }));

            const templatePath = path.join(__dirname, 'templates', 'ticket-log.ejs');
            const renderedLog = await ejs.renderFile(templatePath, { messages: messageArray });

            const logFilePath = path.join(__dirname, 'logs', `ticket-${existingTicket.name}-shewnexe.html`);
            fs.writeFileSync(logFilePath, renderedLog);

            try {
                await interaction.user.send({
                    content: `Merhaba, ticket **${existingTicket.name}** silindi. İşte tüm mesajların log dosyası.`,
                    files: [logFilePath]
                });
            } catch (error) {
                console.error('DM gönderim hatası:', error);
                await interaction.reply({ content: 'Log dosyasını DM olarak gönderemedim. Lütfen DM almayı etkinleştirin.', ephemeral: true });
            }

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === config.deleteticketLog);
            if (logChannel) {
                await logChannel.send({
                    content: `Ticket **${existingTicket.name}** silindi ve log dosyası kullanıcıya DM olarak gönderildi.`,
                    files: [logFilePath]
                });
            }

            await existingTicket.delete();
            await interaction.reply({ content: 'Ticket kanalınız başarıyla silindi.', ephemeral: true });
        }

        if (interaction.customId === 'deleteTicket') {
            const ticketChannel = interaction.channel;
            const user = interaction.user;

            const messages = await ticketChannel.messages.fetch({ limit: 100 });
            const messageArray = messages.map(msg => ({
                author: msg.author.tag,
                authorId: msg.author.id,
                avatar: msg.author.avatar ? msg.author.avatar : 'default_avatar', // Fallback avatar
                content: msg.content,
                createdAt: msg.createdAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
            }));

            const templatePath = path.join(__dirname, 'templates', 'ticket-log.ejs');
            const renderedLog = await ejs.renderFile(templatePath, { messages: messageArray });

            const logFilePath = path.join(__dirname, 'logs', `ticket-${interaction.channel.name}-shewnexe.html`);
            fs.writeFileSync(logFilePath, renderedLog);

            try {
                await user.send({
                    content: `Merhaba, ticket **${interaction.channel.name}** silindi. İşte tüm mesajların log dosyası.`,
                    files: [logFilePath]
                });
            } catch (error) {
                console.error('DM gönderim hatası:', error);
                await interaction.reply({ content: 'Log dosyasını DM olarak gönderemedim. Lütfen DM almayı etkinleştirin.', ephemeral: true });
            }

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === config.deleteticketLog);
            if (logChannel) {
                await logChannel.send({
                    content: `Ticket **${interaction.channel.name}** silindi ve log dosyası kullanıcıya DM olarak gönderildi.`,
                    files: [logFilePath]
                });
            }

            await ticketChannel.delete();
        }
    },
};
