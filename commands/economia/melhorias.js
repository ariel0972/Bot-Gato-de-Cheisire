const { EmbedBuilder } = require('discord.js');
const { loadData } = require('../../utils/JsonHandler');
const { getUserStats } = require('../../DB/db');
const upgrades = require('../../DB/upgrade');

module.exports = {
    data: {
        name: 'melhorias',
        description: 'Mostra um conjunto de melhorias disponíveis para compra',
    },
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;

        // Pega os dados atuais do usuário
        const pntsData = loadData();
        const statsDB = getUserStats(userId, guildId);

        const userData = pntsData[guildId]?.users?.[userId] || { boostFragmentos: 1 };

        const embed = new EmbedBuilder()
            .setTitle('📈 Loja de Melhorias (Fragmentos)')
            .setColor('#FFA500'); // Laranja para diferenciar

        for (const [id, upgrade] of upgrades) {
            let currentLevel, costForNext;

            // Checa se o upgrade é do JSON (fragmentos) ou DB (sonhos)
            if (id === 'boostFragmentos') {
                currentLevel = userData.boostFragmentos;
            } else if (id === 'boostNivelSonhos') {
                currentLevel = statsDB.boostNivelSonhos;
            }

            // Determina o custo
            if (currentLevel >= upgrade.maxLevel) {
                costForNext = "MAX";
            } else {
                costForNext = upgrade.costs[currentLevel + 1];
            }

            embed.addFields({
                name: `${upgrade.name} (Nível ${currentLevel})`,
                value: `**Próximo Nível (${currentLevel + 1}):** ${costForNext} Fragmentos\n*${upgrade.description}*\n(ID: **${id}**)`
            });
        }
        await message.channel.send({ embeds: [embed] });
    }
}