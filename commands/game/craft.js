const { EmbedBuilder } = require('discord.js');
const { getCollection, getUserStats, consumirItems, addCollection } = require("../../DB/db")
const recipes = require("../../DB/recipes")
const loots = require('../../DB/loots')
const rewards = require('../../DB/rewards')
const { saveData, loadData } = require("../../utils/JsonHandler")

module.exports = {
    data: {
        name: 'juntar',
        description: '',
        aliases: ['craft', 'lembrar']
    },
    async execute(message, args) {
        const recipeId = args[0]?.toLowerCase()
        if (!recipeId) {
            const embed = new EmbedBuilder()
                .setTitle(`🧩 Memórias Quebradas`)
                .setDescription('Use `c!juntar <id da memoria>` para recriar uma memória perdida em fragmentos.')
                .setColor('#9b90f6')

            for (const [id, item] of recipes) {
                const ingredientesTexto = item.ingredients.map(ing => {
                    // Tenta achar o nome bonito no loots, se não achar usa o ID mesmo
                    const lootInfo = loots.get(ing.id);
                    const nomeItem = lootInfo ? lootInfo.name : ing.id;
                    return `- ${ing.qtd}x ${nomeItem}`;
                }).join('\n');

                embed.addFields({
                    name: `${item.name} (ID: \`${id}\`) `,
                    value: `Custo: ${item.costFragmentos}<:fragmento:1437959803732234352>\n> ${item.description}\n\n**Ingredientes Neecssários:**\n${ingredientesTexto}`
                });
            }
            return message.reply({ embeds: [embed] })
        }

        const recipe = recipes.get(recipeId)
        if (!recipe) return message.reply('Receita não encontrada')

        const userId = message.author.id
        const guildId = message.guild.id

        const inv = getCollection(userId, guildId)
        // const stats = getUserStats(userId, guildId)
        const pntsData = loadData()
        const userData = pntsData[guildId]?.users?.[userId]

        if (userData.fragmentos < recipe.costFragmentos) {
            return message.reply(`Você precisa de <:fragmento:1437959803732234352> ${recipe.costFragmentos} Fragmentos, mas só tem **${userData.fragmentos}**`)
        }

        const invMap = new Map(inv.map(i => [i.itemId, i.quantity]))
        const items = []

        for (const required of recipe.ingredients) {
            const ownQtd = invMap.get(required.id) || 0

            if (ownQtd < required.qtd) {
                const loot = loots.get(required.id)
                const nome = loot ? loot.name : required.id
                return message.reply(`Você não tem itens o suficiente. Falta: **${required.qtd - ownQtd}x ${nome}**`)
            }

            if (!ownQtd) {
                return message.reply(`Você não possui ${required.id}. Vá procurar!! 😾`)
            }

            items.push(required)
        }

        try {
            consumirItems(userId, guildId, items)

            userData.fragmentos -= recipe.costFragmentos
            saveData(pntsData)

            addCollection(userId, guildId, recipeId, recipe.name, recipe.type || 'memoria')

            await message.reply(`✨ Sucesso! Você criou **${recipe.name}** e gastou ${recipe.costFragmentos} Fragmentos. A nova Memória está no seu inventário!`)
        } catch (error) {
            console.error('Erro de Crafting/Transação:', error.message)
            await message.reply(`Erro! Falha na transação. Certifique-se de que o bot foi reiniciado após as últimas alterações no DB.`)
        }
    }
}