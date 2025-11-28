const { Embed, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    data: {
        name: 'help',
        description: ''
    },
    async execute(message, args) {

        const client = message.client

        const embed = new EmbedBuilder()
            .setTitle('🤖 Painel de Ajuda')
            .setDescription('Aqui estão todos os comandos que você pode usar, separados por categoria:')
            .setColor('#9b90f6'); // Sua cor padrão

        const msgCommands = client.commands

        const msgCommandsList = msgCommands.filter(cmd => cmd.name !== 'ajuda')
            .map(cmd => `- **c!${cmd.data.name}**: ${cmd.data.description || 'Sem descrição'}`)
            .join('\n\n');

        if (msgCommandsList.length > 0) {
            embed.addFields({
                name: 'Comandos de Prefixo (c!)',
                value: msgCommandsList
            });
        }

        await message.channel.send({ embeds: [embed] });
    }
}