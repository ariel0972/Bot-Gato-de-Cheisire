const { PermissionsBitField } = require('discord.js')
const { addCollection } = require('../../DB/db')
const allItems = require('../../DB/models/items')

module.exports = {
    data: {
        name: 'additem',
        description: '[ADMIN] Chama um evento esclusivo para acontecer no servidor',
        aliases: ['ce', 'event']
    },
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Você precisa ter a permissão de "Gerenciar Servidor" para usar este comando.');
        }

        const targetUser = message.mentions.users.first() || message.author;
        
        // Remove a menção dos argumentos para não atrapalhar a busca do item
        // (Se o primeiro arg for menção, removemos ele)
        if (message.mentions.users.size > 0) {
            args.shift(); 
        }

        let itemId = null
        let qty = 1

        for (let i = Math.min(args.length, 4); i >= 1; i--) {
            const guessId = args.slice(0, i).join(' ').toLowerCase()

            if (allItems.has(guessId)) {
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
            return message.reply('Item não encontrado.')
        }

        const item = allItems.get(itemId)

        const userId = targetUser.id
        const guildId = message.guild.id

        try {
            for (let i = 0; i < qty; i++){
                addCollection(userId, guildId, itemId, item.name, item.type)
            }
            await message.reply(`✅ Adicionado **${qty}x ${item.name}** ao inventário de **${targetUser.username}**.`)
        } catch (error) {
            console.error('Erro no additem:', error)
            message.reply('Erro ao adicionar item no banco de dados.')
        }
    }
}