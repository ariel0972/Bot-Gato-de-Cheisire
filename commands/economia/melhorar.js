const { loadData, saveData } = require('../../utils/JsonHandler');
const { getUserStats, db } = require('../../DB/db'); // Precisamos do 'db' para salvar
const upgrades = require('../../DB/upgrade');

module.exports = {
    data: {
        name: 'melhorar',
        description: 'Compra um nível de melhoria usando Fragmentos.',
    },
    async execute(message, args) {
        const upgradeId = args[0];
        if (!upgradeId) {
            return message.reply('Use `c!melhorias` para ver os IDs das melhorias.');
        }

        const upgrade = upgrades.get(upgradeId);
        if (!upgrade) {
            return message.reply(`Melhoria \`${upgradeId}\` não encontrada.`);
        }

        const userId = message.author.id;
        const guildId = message.guild.id;

        // Pega os dados
        const pntsData = loadData();
        const statsDB = getUserStats(userId, guildId);
        
        const userData = pntsData[guildId]?.users?.[userId];
        if (!userData) {
            return message.reply('Erro: Não encontrei seus dados de fragmentos. Tente enviar uma mensagem primeiro.');
        }

        // Determina o nível atual e o próximo
        let currentLevel, nextLevel;
        if (upgradeId === 'boostFragmentos') {
            currentLevel = userData.boostFragmentos;
        } else if (upgradeId === 'boostNivelSonhos') {
            currentLevel = statsDB.boostNivelSonhos;
        }

        nextLevel = currentLevel + 1;
        
        if (currentLevel >= upgrade.maxLevel) {
            return message.reply(`Você já está no nível máximo para **${upgrade.name}**!`);
        }

        // Verifica o Custo
        const cost = upgrade.costs[nextLevel];
        if (userData.fragmentos < cost) {
            return message.reply(`Você precisa de **${cost} Fragmentos** para comprar o Nível ${nextLevel}, mas só tem **${userData.fragmentos}**.`);
        }

        // --- Transação ---
        try {
            // 1. Subtrai os Fragmentos (do JSON)
            userData.fragmentos -= cost;

            // 2. Aumenta o Nível da Melhoria (no DB ou JSON)
            if (upgradeId === 'boostFragmentos') {
                userData.boostFragmentos = nextLevel;
            } else if (upgradeId === 'boostNivelSonhos') {
                // Atualiza o DB
                db.prepare('UPDATE usuarios SET boostNivelSonhos = ? WHERE userId = ? AND guildId = ?')
                  .run(nextLevel, userId, guildId);
            }
            
            // 3. Salva o JSON (que contém os fragmentos gastos E o nível novo)
            saveData(pntsData);

            await message.reply(`Melhoria comprada! **${upgrade.name}** agora está no **Nível ${nextLevel}**!`);

        } catch (error) {
            console.error(error);
            await message.reply('Ocorreu um erro ao processar sua melhoria.');
        }
    }
};