const { EmbedBuilder } = require('discord.js');
const { getCollection } = require('../../DB/db.js')
const loots = require('../../DB/loots.js')
const rewards = require('../../DB/rewards.js')
const recipes = require('../../DB/recipes.js')

const rarityRank = {
    'Único': 6,
    'Lendário': 5,
    'Épico': 4,
    'Raro': 3,
    'Incomum': 2,
    'Comum': 1
};

module.exports = {
    data: {
        name: 'inventario',
        description: 'Mostra os fragmentos de sonhos e memórias maravilhosas✨.',
        aliases: ['inv', 'i', 'chapeu', 'bag']
    },
    async execute(message, args) {
        const userId = message.author.id
        const guildId = message.guild.id

        const inv = getCollection(userId, guildId)

        if (!inv || inv.length === 0) {
            return message.reply('> Sua coleção está vazia! Use `c!explorar` para encontrar itens.')
        }

        inv.sort((a, b) => {
            const A = loots.get(a.itemId) || rewards.get(a.itemId) || recipes.get(a.itemId)
            const B = loots.get(b.itemId) || rewards.get(b.itemId) || recipes.get(b.itemId)

            if (!A) return 1
            if (!B) return -1

            const rankA = rarityRank[A.rarity] || 0
            const rankB = rarityRank[B.rarity] || 0

            return rankB - rankA
        })

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Coleção de ${message.author.username}`)
            .setColor('#5560f3'); // Púrpura

        const itens = inv.map(dbItem => {
            const details = loots.get(dbItem.itemId) || rewards.get(dbItem.itemId) || recipes.get(dbItem.itemId)

            if (!details) return `- ❓ **Item desconhecido** ${dbItem.itemId} (x${dbItem.quantity})`

            let rare
            switch (details.rarity) {
                case 'Comum':
                    rare = '<:fragmento:1437959803732234352>'
                    break;
                case 'Incomum':
                    rare = '<:fragverde:1437962200173252769>'
                    break;
                case 'Raro':
                    rare = '<:fragrosa:1437962151284441189>'
                    break;
                case 'Épico':
                    rare = '<:fraglaranja:1437962174105649273>'
                    break;
                case 'Lendário':
                    rare = '<:fragvermelho:1437962117545328861>'
                    break;
                case 'Único':
                    rare = '🖼️'
                    break;
                default:
                    rare = '<:fragmento:1437959803732234352>'
                    break;
            }

            if (details) {
                return `- ${rare} **${details.name}** (x${dbItem.quantity}) - *${details.rarity || 'Desconhecido'}*`
            }

        }).join('\n')

        embed.setDescription(itens);
        await message.channel.send({ embeds: [embed] });
    }
}