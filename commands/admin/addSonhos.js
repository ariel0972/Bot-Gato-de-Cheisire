const { PermissionsBitField } = require('discord.js')
const { updateUserStats } = require('../../DB/db')

module.exports = {
    data: {
        name: 'addsonhos',
        description: '[ADMIN] Chama um evento esclusivo para acontecer no servidor',
        aliases: ['as', 'sonhar']
    },
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('Você precisa ter a permissão de "Gerenciar Servidor" para usar este comando.');
        }

        const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        
        if (!target) {
            return message.reply('Por favor, mencione um usuário ou diga o ID dele.');
        }

        // 3. Pega a quantidade
        // O args[1] é o número (ex: !addsonhos @Ariel 100)
        // Se o usuário marcou primeiro, o args[0] vira a menção, então pegamos o próximo.
        let amountStr = args[0].includes(target.id) ? args[1] : args[0];
        const amount = parseInt(amountStr);

        if (isNaN(amount)) {
            return message.reply('Por favor, digite um número válido de Sonhos.');
        }

        // 4. Adiciona ao Banco de Dados
        // updateUserStats(userId, guildId, tempo(0), pontos(amount))
        try {
            updateUserStats(target.id, message.guild.id, 0, amount);

            await message.reply(`✅ Foram adicionados **${amount} Sonhos** para **${target.username}** com sucesso!`);
        } catch (error) {
            console.error(error);
            await message.reply('Ocorreu um erro ao atualizar o banco de dados.');
        }
    }
}