const { PermissionsBitField, ChannelType } = require('discord.js')
const enigmas = require('./enigmas')
const { addCollection } = require('../DB/db')

const timouut = 120000

const canal = '1417922374917030028'

function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

async function startEngimaEvent(client) {
    if (client.isEventActive) {
        return console.log('[EVENTO] Pulando novo enigma: Um evento já está ativo.')
    }
    client.isEventActive = true

    let targetChannel

    if (canal) {
        targetChannel = client.channels.cache.get(canal)
    }

    if (!targetChannel) {
        const textChannels = client.channels.cache.filter(c =>
            c.type === ChannelType.GuildText &&
            c.viewable &&
            c.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)
        )
        targetChannel = textChannels.random
    }

    if (!targetChannel) {
        client.isEventActive = false;
        return console.log('[EVENTO] Erro: Nenhum canal disponível.');
    }

    const randomRiddle = enigmas[Math.floor(Math.random() * enigmas.length)]

    const cleanAnswer = normalize(randomRiddle.answer)

    await targetChannel.send(`# ✨ **Evento Surpresa!** ✨ \nO gato Risonho tem um enigma para vocês! O primeiro a responder corretamente no chat ganha um item LENDÁRIO!\n\n**ENIGMA:** ${randomRiddle.question}`)
    const collector = await targetChannel.createMessageCollector({
        filter: m => !m.author.bot,
        time: timouut
    })


    collector.on('collect', async (m) => {
        const content = normalize(m.content)

        if (content.includes(cleanAnswer)) {

            const userId = m.author.id
            const guildId = m.guild.id

            try {
                addCollection(userId, guildId, randomRiddle.rewardId, randomRiddle.rewardName, 'colecionavel')

                await m.reply(`🎉 **RESPOTA CORRETA!** 🎉 \nParabens, ${m.author}! Você acertou com a respota e ganhou **${randomRiddle.rewardName}**! O item foi adicionado ao seu inventario.`)
            } catch (error) {
                await rChannel.send('O tempo acabou! A resposta correta ||Ta espiando por que? Hein?||. O Gato Risonho se foi...')
            }
            collector.stop('venceu')

        } else {
            if (Math.random() < 0.4){
                const respostasErro = [
                    'Errou feio...',
                    'Eu acho que não é isso',
                    'Hmmmm. Belíssima resposta, mas não.',
                    'Você tem mais uma chance...',
                    'Você já viu um gato responder enigmas? Eu já, mas tu nem chega às minhas patas',
                    'Eu acho que você errou.'
                ];
                const fraseSorteada = respostasErro[Math.floor(Math.random() * respostasErro.length)];
                await m.reply(fraseSorteada);
            }
        }
    })
    
    collector.on('end', (collected, reason) => {
        // 7. REMOVER O LOCK (Sempre libera o bot para o próximo evento)
        client.isEventActive = false

        // Se o motivo NÃO foi 'venceu', significa que o tempo acabou
        if (reason !== 'venceu') {
            targetChannel.send(`⏰ **O TEMPO ACABOU!**\nNinguém acertou o enigma do Gato. A resposta era **"${randomRiddle.answer}"**.`);
        }
    })
}

module.exports = { startEngimaEvent }