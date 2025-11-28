const { PermissionsBitField } = require('discord.js')
const { loadData, saveData } = require('../../utils/JsonHandler')

module.exports = {
    data: {
        name: 'allowchannel',
        description: 'Permite que leia apenas alguns canais de voz',
    },
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Você precisa ter a permissão de "Gerenciar Servidor" para usar este comando.');
        }

        const channelId = message.channel.id
        const guildId = message.guild.id
        const Pontos = loadData()

        if (!Pontos[guildId]) {
            Pontos[guildId] = { settings: { allowedChannels: [] }, users: {} };
        }
        if (!Pontos[guildId].settings) {
            Pontos[guildId].settings = { allowedChannels: [] };
        }
        if (!Pontos[guildId].settings.allowedChannels) {
            Pontos[guildId].settings.allowedChannels = [];
        }

        if (Pontos[guildId].settings.allowedChannels.includes(channelId)) {
            return message.reply('Este canal já está sendo contado.');
        }

        Pontos[guildId].settings.allowedChannels.push(channelId);
        saveData(Pontos); // Salva os dados

        await message.reply('Este canal agora está sendo contado para pontos de mensagem!');
    }
}