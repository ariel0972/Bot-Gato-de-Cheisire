const { Events } = require('discord.js');
const { updateUserStats } = require('../DB/db');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        if (!newState.guild || !newState.guild.available) return;

        const userId = newState.id;
        const guild = newState.guild;

        const sessionKey = `${userId}-${guild.id}`

        const afkChannelId = guild.afkChannelId;

        if (newState.channelId && newState.channelId !== afkChannelId) {
            if (!client.voiceSessions.has(userId)) {
                console.log(`[Rastreio] ${userId} entrou na call. Iniciando contagem.`);
                client.voiceSessions.set(sessionKey, Date.now());
            }
        } else if (oldState.channelId && (!newState.channelId || newState.channelId === afkChannelId)) {
            if (client.voiceSessions.has(sessionKey)) {
                const startTime = client.voiceSessions.get(sessionKey)

                const durationMs = Date.now() - startTime;
                const durationSeconds = Math.floor(durationMs / 1000);

                const pointsEarned = durationSeconds;

                console.log(`[Rastreio] ${userId} saiu da call. Ganhou ${pointsEarned} pontos em ${durationSeconds} segundos.`);

                if (durationSeconds > 0) { // Só salva se for mais de 0 segundos
                    updateUserStats(userId, guild.id, durationSeconds, pointsEarned);
                }

                client.voiceSessions.delete(sessionKey);
            }
        }
    }
}