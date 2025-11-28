const { Events, ActivityType, PresenceUpdateStatus, ChannelType } = require('discord.js')
const { setupDatabase } = require('../DB/db');
const { startEngimaEvent } = require('../utils/enigmaScheduler');

module.exports = {
    name: Events.ClientReady,
    onde: true,
    async execute(client) {
        console.log(`✅ Estou pronto! Login realizado com sucesso em ${client.user.tag}`)
        client.user.setStatus(PresenceUpdateStatus.Online);
        client.user.setActivity('Ouvindo a call no chat!', {
            type: ActivityType.Playing,
        });

        // --- NOVO CÓDIGO: VERIFICAR CALLS ATIVAS ---
        console.log('[Rastreio] Verificando calls ativas após reinício...');

        try {
            // 2. Pega todos os servidores (guilds) que o bot está
            // Usamos 'fetch' para garantir que temos dados atualizados
            const guilds = await client.guilds.fetch();

            for (const [guildId, oauthGuild] of guilds) {
                // Pega o objeto 'guild' completo
                const guild = await oauthGuild.fetch();

                // 3. Pega todos os canais de voz do servidor
                const voiceChannels = guild.channels.cache.filter(c =>
                    c.type === ChannelType.GuildVoice && // É um canal de voz
                    c.id !== guild.afkChannelId &&      // Não é o canal AFK
                    c.members.size > 0                  // Tem gente dentro
                );

                if (voiceChannels.size === 0) continue; // Pula se não há canais de voz ativos

                // 4. Itera sobre cada canal de voz que tem membros
                for (const [channelId, channel] of voiceChannels) {
                    // 5. Itera sobre cada membro no canal
                    for (const [memberId, member] of channel.members) {

                        // 6. Se não for bot, começa a rastrear
                        if (!member.user.bot) {

                            const sessionKey = `${memberId}-${guild.id}`

                            // 7. Verifica se já não está sendo rastreado (segurança)
                            if (!client.voiceSessions.has(memberId)) {
                                console.log(`[Rastreio] Encontrado ${member.user.username} em call. Reiniciando contagem.`);

                                // Adiciona ao Map com a hora atual (hora do login do bot)
                                client.voiceSessions.set(sessionKey, Date.now());
                            }
                        }
                    }
                }
            }

            
            
        } catch (error) {
            console.error('[Rastreio] Erro ao verificar calls ativas:', error);
        }
        
        client.isEventActivity = false

        const intervaltime = 3 * 60 * 60 * 1000

        setInterval(() => {
            startEngimaEvent(client)
        }, intervaltime)

        const agora = new Date()
        
        console.log('[Rastreio] Verificação de calls concluída.')
        console.log(`---[Ligou às: ${agora.getHours()}h${agora.getMinutes()}]---`)
    }
}