const { checkItem, updateBackground, swapEquippedBackground } = require('../../DB/db');
const shop = require('../../DB/shop.js');

module.exports = {
    data: {
        name: 'equipar',
        description: 'Equipa um fundo de perfil do seu inventário.',
        aliases: ['equip', 'usar']
    },
    async execute(message, args) {
        let itemId
        for (let i = Math.min(args.length, 4); i >= 1; i--) {
            const guessId = args.slice(0, i).join(' ').toLowerCase()

            if (shop.has(guessId)) {
                itemId = guessId
                break
            }
        }
        if (!itemId) return message.reply('Você precisa dizer o ID do item que quer equipar. Use `c!inventario`.')


        const item = shop.get(itemId)
        if (!item) return message.reply('Erro: Esse item existe no seu inventário mas não foi encontrado no catálogo da loja.')

        const userId = message.author.id;
        const guildId = message.guild.id;

        // 1. Verifica se o usuário possui o item
        const ownsItem = checkItem(userId, guildId, itemId);
        if (!ownsItem) {
            return message.reply(`Você não possui o item \`${itemId}\`. Compre-o na \`c!loja\`.`);
        }

        // 3. Equipa o item (salvando no 'usuarios' table)
        try {
            swapEquippedBackground(userId, guildId, itemId)
            await message.reply(`Equipado! Você está usando o fundo **${item.name}**. Use \`c!perfil\` para ver.`)
        } catch (error) {
            console.error('Erro ao equipar:', error)
            await message.reply('Ocorreu um erro ao tentar equipar este item.')
        }
    }
};