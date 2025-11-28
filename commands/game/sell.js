const recipes = require('../../DB/recipes')
const loots = require('../../DB/loots')
const { consumirItems, getCollection, updateUserStats } = require('../../DB/db')
const { EmbedBuilder } = require('discord.js')

const rarityRank = {
    'Único': 6,
    'Lendário': 5,
    'Épico': 4,
    'Raro': 3,
    'Incomum': 2,
    'Comum': 1
}

module.exports = {
    data: {
        name: 'trocar',
        description: 'Troque itens por Sonhos',
        aliases: ['sell', 'trade', 't']
    },
    async execute(message, args) {
        let itemId = null
        let qty = 1

        for (let i = Math.min(args.length, 4); i >= 1; i--) {
            const guessId = args.slice(0, i).join(' ').toLowerCase()

            if (loots.has(guessId)) {
                itemId = guessId

                const ultimoIndex = i

                if (args[ultimoIndex]) {
                    const qtd = parseInt(args[ultimoIndex], 10)

                    if (!isNaN(qtd) && qtd > 0) {
                        qty = qtd
                    }
                }
                break
            }
        }


        if (!itemId) {
            const userId = message.author.id
            const guildId = message.guild.id

            const inv = getCollection(userId, guildId)

            if (!inv || inv.length === 0) {
                return message.reply('Você não possui itens para trocar no momento')
            }

            inv.sort((a, b) => {
                const A = loots.get(a.itemId) || recipes.get(a.itemId)
                const B = loots.get(b.itemId) || recipes.get(b.itemId)

                if (!A) return 1
                if (!B) return -1

                const valA = A.cost || A.value || 0
                const valB = B.cost || B.value || 0

                const totalA = valA
                const totalB = valB

                if (totalB === totalA){
                    const rankA = rarityRank[A.rarity] || 0
                    const rankB = rarityRank[B.rarity] || 0
                    return rankB - rankB
                }

                return totalB - totalA
            })

            const embed = new EmbedBuilder()
                .setTitle(`🎒 Coleção de ${message.author.username}`)
                .setDescription('Use `c!trocar <id da do item>` para recriar uma memória perdida em fragmentos.')
                .setColor('#9b90f6')

            const invMap = inv.map(dbItem => {
                const details = loots.get(dbItem.itemId) || recipes.get(dbItem.itemId)

                if (details && (details.value || details.cost)) {
                    const valor = details.value || details.cost
                    return `- **${dbItem.itemId}** (x${dbItem.quantity}) - Vale: ${valor}`
                }
                return null
            }).filter(item => item !== null).join('\n')

            let text = invMap
            if (text.length > 1020) {
                text = invMap.substring(0, 1000) + 'e mais alguns...'
            }

            if (text.length === 0) {
                return message.reply('Você tem itens, mas nenhuma deles podem ser trocados')
            }

            embed.addFields({ name: 'Items disponíveis troca', value: invMap })
            return message.reply({ embeds: [embed] })

        }

        const item = recipes.get(itemId) || loots.get(itemId)

        if (!item) return message.reply('ID inválido ou o item não pode ser trocado.')

        const userId = message.author.id
        const guildId = message.guild.id

        try {
            consumirItems(userId, guildId, [{ id: itemId, qtd: qty }])

            const valor = item.value || item.cost || 0

            if (valor === 0) {
                return message.reply('Este item não tem valor comercial no País das Maravilhas.')
            }

            const sonhos = valor * qty
            updateUserStats(userId, guildId, 0, sonhos)

            await message.reply(`Você trocou **${qty}x  ${item.name}** por ${sonhos} Sonhos!`)
        } catch (error) {
            await message.reply(`Falha na troca: Você não possui a Memória/Item \`${item.name}\` para trocar.`)
        }
    }
}