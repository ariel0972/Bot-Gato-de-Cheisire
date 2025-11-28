const shop = require('../../DB/shop.js')
const { getUserStats, Comprar, updateBackground, checkItem, addItem } = require('../../DB/db.js'); // Ajuste o caminho

module.exports = {
    data: {
        name: 'comprar',
        description: 'Compra um item da loja.',
        aliases: ['buy']
    },
    async execute(message, args) {
        let itemId = null

        for (let i = Math.min(args.length, 4); i >= 1; i--) {
            const guessId = args.slice(0, i).join(' ').toLowerCase()

            if (shop.has(guessId)) {
                itemId = guessId
                break
            }
        }

        if (!itemId) {
            return message.reply('Você precisa me dizer o ID do item. Use `c!loja` para ver os IDs.');
        }

        const item = shop.get(itemId);
        if (!item) {
            return message.reply(`O item com ID \`${itemId}\` não foi encontrado.`);
        }

        const userId = message.author.id;
        const guildId = message.guild.id;

        const hasItem = checkItem(userId, guildId)
        if (hasItem){
            return message.reply(`Você já posseui o item ${item.name}`)
        }

        // 2. Verifica se o usuário tem pontos
        const stats = getUserStats(userId, guildId);
        if (stats.totalPoints < item.price) {
            return message.reply(`Você não tem Sonhos suficientes! Você tem **${stats.totalPoints}**, mas o item custa **${item.price}**.`);
        }

        // 3. Efetua a transação
        try {
            // Subtrai os pontos
            Comprar(userId, guildId, item.price);
            
            // Define o novo fundo (seja cor ou imagem)
            addItem(userId, guildId, itemId);

            await message.reply(`Parabéns! Você comprou **${item.name}** por ${item.price} <:Sonhos:1437973455579385987> Sonhos! Use \`c!gr\` para ver seu novo fundo.`);
        
        } catch (error) {
            console.error('Erro ao comprar item:', error);
            await message.reply('Ocorreu um erro ao processar sua compra.');
        }
    }
};