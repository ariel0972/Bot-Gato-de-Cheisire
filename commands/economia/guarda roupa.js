const { EmbedBuilder } = require('discord.js');
const { getInv } = require('../../DB/db.js')
const shop = require('../../DB/shop.js')

module.exports = {
    data: {
        name: 'guardaRoupa',
        description: `Mostra os fundos de perfil que você possui.`,
        aliases: ['wardrobe', 'drobe', 'costume', 'gr']
    },
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const inventory = getInv(userId, guildId);

        if (inventory.length === 0) {
            return message.reply('Seu inventário está vazio. Use `!loja` para comprar itens.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventário de ${message.author.username}`)
            .setColor('#9b90f6')
            .setDescription('Use `!equipar [ID_DO_ITEM]` para usar um fundo.');

        // Mapeia os itens do inventário para seus nomes
        const itemsList = inventory.map(item => {
            const itemDetails = shop.get(item.itemId); // Pega o nome do catálogo
            if (itemDetails) {
                return `**${itemDetails.name}** (ID: \`${item.itemId}\`)`;
            }
            return `Item Desconhecido (ID: \`${item.itemId}\`)`;
        }).join('\n');

        embed.addFields({ name: 'Seus Itens', value: itemsList });

        await message.channel.send({ embeds: [embed] });
    }
};