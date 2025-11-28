const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const shop = require('../../DB/shop.js') // Ajuste o caminho se necessário

module.exports = {
    data: {
        name: 'loja',
        description: 'Mostra os itens disponíveis para compra com Sonhos.',
        aliases: ['shop', 'l']
    },
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🏪 Loja de Sonhos')
            .setDescription('Use `!comprar [ID_DO_ITEM]` para comprar um fundo de perfil.\n ')
            .setColor('#9b90f6'); // Sua cor

        // Adiciona cada item do catálogo ao Embed
        for (const [id, item] of shop) {
            embed.addFields({
                name: `<:Sonhos:1437973455579385987> ${item.name} - ${item.price} Sonhos`,
                value: `(ID: **${id}**)`
            });
        }

        await message.channel.send({ embeds: [embed]})
    }
};