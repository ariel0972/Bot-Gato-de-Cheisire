const { Events } = require('discord.js');
const { getData, saveData } = require('../utils/JsonHandler'); // Ajuste o caminho

setInterval(() => {
    saveData(getData())
    const agora = new Date()
    console.log(`[AutoSave] Dados Salve ás [${agora.getHours()}h${agora.getMinutes()}]`)
}, 120000);

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const userId = message.author.id;

        const pntsData = getData()
        const guildData = pntsData[guildId]

        if (!guildData || !guildData.settings || !guildData.settings.allowedChannels) {
            // pntsData[guildId] = { settings: { allowedChannels: [] }, users: {} }
            // saveData(pntsData)
            return
        }

        if (guildData.settings.allowedChannels.length > 0 && !guildData.settings.allowedChannels.includes(channelId)) {
            return
        }

        if (!guildData.users) {
            guildData.users = {};
        }

        // Garante que o usuário exista
        if (!guildData.users[userId]) {
            guildData.users[userId] = {
                username: `${message.author.username}`,
                mensagens: 0,
                fragmentos: 0,
                boostFragmentos: 1
            };
        }

        // Adiciona pontos
        const userData = guildData.users[userId];
        userData.mensagens += 1;

        if (userData.mensagens % 6 === 0) {
            const boostNivel = userData.boostFragmentos || 1
            const morePnts = Math.floor(Math.random() * 3) + 1 * boostNivel
            userData.fragmentos += morePnts

        }
        
        pntsData[guildId].users[userId] = userData
    }
};